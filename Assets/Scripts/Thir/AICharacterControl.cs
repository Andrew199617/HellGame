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
        public UnityEngine.AI.NavMeshAgent Agent { get; private set; }             // the navmesh agent required for the path finding
        public ThirdPersonCharacter Character { get; private set; } // the character we are controlling
        public Transform Target;                                    // target to aim for

        private float deltaTime = 2;
        private float timeBeforeHit = 2;

        private State myState;

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
            Agent = GetComponentInChildren<UnityEngine.AI.NavMeshAgent>();
            Character = GetComponent<ThirdPersonCharacter>();

	        Agent.updateRotation = false;
	        Agent.updatePosition = true;
            myState = State.MovingToPlayer;

            
        }

        /// <summary>
        /// State Machine for enemy
        /// </summary>
        private void Update()
        {
            if (Target != null)
            {
                Agent.SetDestination(Target.position);
            }

            var animator = GetComponent<Animator>();

            if (Agent.remainingDistance < Agent.stoppingDistance / 2 && myState != State.Attacking)
            {
                myState = State.Idle;
            }
            else if (Agent.remainingDistance > Agent.stoppingDistance)
            {
                myState = State.MovingToPlayer;
            }


            switch (myState)
            {
                case State.Idle:
                    Character.Move(Vector3.zero, false, false);
                    deltaTime += Time.deltaTime;
                    if (deltaTime > timeBeforeHit)
                    {
                        if (Agent.remainingDistance < Agent.stoppingDistance / 2)
                        {
                            myState = State.Attacking;
                            deltaTime = 0;
                        }
                    }
                    break;
                case State.MovingToPlayer:
                    if (Agent.remainingDistance > Agent.stoppingDistance)
                    {
                        animator.SetBool("IsWalking", true);
                        Character.Move(Agent.desiredVelocity, false, false);
                    }
                    else
                    {
                        Character.Move(Vector3.zero, false, false);
                        animator.SetBool("IsWalking", false);
                        myState = State.CirclePlayer;
                    }
                    break;
                case State.Attacking:
                    Character.Move(Vector3.zero, false, false);
                    animator.SetBool("IsAttacking", true);
                    break;
                case State.Defending:
                    break;
                case State.CirclePlayer:

                    //animator.SetBool("IsStraffing", true);
                    //Get an arrow from the players position to my position.
                    Vector3 offset = transform.position - Target.position;
                    
                    //Slowly Rotate the arrow in a circle around its origin, the player.
                    offset = Quaternion.Euler(0, 1, 0) * offset;
                    
                    //Add the Arrow to the players position and you get where the enemy should go.
                    var goalPosition = offset + Target.position;
                    
                    //You want an arrow from the enemy to the position he wants to go.
                    var movementDirection = transform.position - goalPosition;

                    transform.position += movementDirection * Agent.speed * Time.deltaTime;
                    var direction = Target.position - transform.position;
                    direction.y = 0;
                    transform.rotation = Quaternion.LookRotation(direction, Vector3.up);
                    break;
            }

        }

        public void FinishedAttack()
        {
            var animator = GetComponent<Animator>();
            animator.SetBool("IsAttacking", false);
            animator.SetInteger("CurrentAttack", Random.Range(1,3));
            myState = State.Idle;
        }

        public void IsHit()
        {
            var animator = GetComponent<Animator>();
            animator.SetBool("IsHit", true);
        }

        public void HitFinished()
        {
            var animator = GetComponent<Animator>();
            animator.SetBool("IsHit", false);
        }

        public void SetTarget(Transform target)
        {
            this.Target = target;
        }
    }
}
