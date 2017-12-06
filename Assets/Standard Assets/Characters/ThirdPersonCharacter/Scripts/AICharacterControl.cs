using System;
using UnityEngine;
using UnityEngine.SceneManagement;

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
            if (target != null)
            {
                agent.SetDestination(target.position);
            }

            var animator = GetComponent<Animator>();

            if (agent.remainingDistance < agent.stoppingDistance / 2)
            {
                myState = State.Attacking;
            }
            else if (agent.remainingDistance > agent.stoppingDistance)
            {
                myState = State.MovingToPlayer;
            }

            switch (myState)
            {
                case State.Idle:
                    character.Move(Vector3.zero, false, false);
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

                    Vector3 offset = transform.position - target.position;
                    //offset = offset.normalized;
                    offset = Quaternion.Euler(0, 1, 0) * offset;
                    offset += target.position;

                    var movementDirection = transform.position - offset;
                    transform.position += movementDirection * agent.speed * Time.deltaTime;
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
            myState = State.Idle;
        }


        public void SetTarget(Transform target)
        {
            this.target = target;
        }
    }
}
