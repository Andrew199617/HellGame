using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DemonMage : BaseEnemy
{

    public Transform demonsRightHand;
    public GameObject fireBall;
    public int fireBallSpeed;


    public void ShootFireball()
    {
        //Create a fireball where the demonMage's RightHand is.
        var quaternion = Quaternion.LookRotation(transform.forward, transform.up);
        var newFireBall = Instantiate(fireBall,demonsRightHand.position, quaternion, null);

        //Add a force in the direction of the player
        var fireBallRigidbody =  newFireBall.GetComponent<Rigidbody>();
        if (fireBallRigidbody)
        {
            fireBallRigidbody.AddForce(transform.forward * fireBallSpeed);
        }

    }


}
