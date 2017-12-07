using System;
using UnityEngine;
using UnityEngine.SceneManagement;
using Random = UnityEngine.Random;

namespace UnityStandardAssets.Characters.ThirdPerson
{
    [RequireComponent(typeof (UnityEngine.AI.NavMeshAgent))]
    [RequireComponent(typeof (ThirdPersonCharacter))]
    public class AICharacterControl : MonoBehaviour
    {
        public UnityEngine.AI.NavMeshAgent agent { get; private set; }             // the navmesh agent required for the path finding
        public ThirdPersonCharacter character { get; private set; } // the character we are controlling
        public Transform target;                                    // target to aim for

        private State myState;
        private float deltaTime = 2;
        private float timeBeforeCanAttack = 2;
        private bool lookAtPlayer;


        private enum State
        {
            Idle,
            MovingToPlayer,
            Attacking, 
            Defending,
            CirclePlayer
        }

        private void Start()
        {
            // get the components on the object we need ( should not be null due to require component so no need to check )
            agent = GetComponentInChildren<UnityEngine.AI.NavMeshAgent>();
            character = GetComponent<ThirdPersonCharacter>();

	        agent.updateRotation = false;
	        agent.updatePosition = true;
            myState = State.MovingToPlayer;
        }

        /// <summary>
        /// State Machine for enemy
        /// </summary>
        private void Update()
        {
            if(lookAtPlayer)
            {
                LookAtPlayer();
            }

            if (target != null)
            {
                agent.SetDestination(target.position);
            }

            var animator = GetComponent<Animator>();

            if (agent.remainingDistance < agent.stoppingDistance / 2 && myState != State.Idle)
            {
                myState = State.Attacking;
                animator.SetBool("IsStraffing", false);
            }
            else if (agent.remainingDistance > agent.stoppingDistance)
            {
                myState = State.MovingToPlayer;
                animator.SetBool("IsStraffing", false);
            }

            switch (myState)
            {
                case State.Idle:
                    character.Move(Vector3.zero, false, false);
                    deltaTime += Time.deltaTime;
                    //If enemy can attack.
                    if (deltaTime > timeBeforeCanAttack)
                    {
                        //If enemy is close enough to attack.
                        if (agent.remainingDistance < agent.stoppingDistance / 2)
                        {
                            myState = State.Attacking;
                            deltaTime = 0;
                        }
                    }
                    break;
                case State.MovingToPlayer:
                    if (agent.remainingDistance > agent.stoppingDistance)
                    {
                        animator.SetBool("IsWalking", true);
                        character.Move(agent.desiredVelocity, false, false);
                    }
                    else
                    {
                        character.Move(Vector3.zero, false, false);
                        animator.SetBool("IsWalking", false);
                        myState = State.CirclePlayer;
                    }
                    break;
                case State.Attacking:
                    character.Move(Vector3.zero, false, false);
                    animator.SetBool("IsAttacking",true);
                    break;
                case State.Defending:
                    break;
                case State.CirclePlayer:

                    animator.SetBool("IsStraffing",true);

                    Vector3 offset = transform.position - target.position;
                    //offset = offset.normalized;
                    offset = Quaternion.Euler(0, 45, 0) * offset;
                    offset += target.position;

                    var movementDirection = transform.position - offset;
                    transform.position += movementDirection.normalized * agent.speed * Time.deltaTime;
                    var direction = target.position - transform.position;
                    direction.y = 0;
                    transform.rotation = Quaternion.LookRotation(direction, Vector3.up);
                    break;
            }

        }

        public void FinishedAttack()
        {
            var animator = GetComponent<Animator>();
            animator.SetBool("IsAttacking", false);
            //animator.SetInteger("CurrentAttack",Random.Range(1,3));
            myState = State.Idle;
        }

        public void AttackStarted()
        {
            lookAtPlayer = true;
        }

        public void ShootFireball()
        {
            var demonMage = GetComponent<DemonMage>();
            //If i am a DemonMage
            if (demonMage)
            {
                demonMage.ShootFireball();
            }
            lookAtPlayer = false;
        }

        public void LookAtPlayer()
        {
            Vector3 direction = target.position - transform.position;
            transform.rotation = Quaternion.LookRotation(direction, transform.up);

            transform.rotation = Quaternion.Euler(0, transform.rotation.eulerAngles.y, 0);
        }

        public void SetTarget(Transform target)
        {
            this.target = target;
        }
    }
}
