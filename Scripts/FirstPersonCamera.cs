using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FirstPersonCamera : MonoBehaviour
{
    public int RotationSpeed;
	
	// Update is called once per frame
	void Update ()
	{
	    TurnRight(Input.GetAxis("Mouse X") * RotationSpeed);
	    LookUp(Input.GetAxis("Mouse Y") * RotationSpeed / 2);

	    transform.rotation = Quaternion.Euler(transform.rotation.eulerAngles.x,transform.rotation.eulerAngles.y,0);
	}

    private void LookUp(float turnAmount)
    {
        if (Math.Abs(turnAmount) > 0)
        {
            var newRotation = (transform.up + transform.forward).normalized;
            newRotation.z = 0;
            if (newRotation.magnitude > 0)
            {
                var newQuaternion = Quaternion.LookRotation(newRotation, transform.up);
                transform.rotation = Quaternion.RotateTowards(transform.rotation, newQuaternion, turnAmount);
            }
        }
    }

    private void TurnRight(float turnAmount)
    {
        if (transform.right.magnitude > 0 && Math.Abs(turnAmount) > 0)
        {
            var newRotation = transform.right;
            var newQuaternion = Quaternion.LookRotation(newRotation, Vector3.up);
            transform.rotation = Quaternion.RotateTowards(transform.rotation, newQuaternion, turnAmount);
        }

    }
}
