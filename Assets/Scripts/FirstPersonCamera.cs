using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FirstPersonCamera : MonoBehaviour
{

    public float RotationSpeed;
	// Update is called once per frame
	void Update ()
	{
	    //Mouse Y might need to be diffrent for headset.
        LookDown(Input.GetAxis("Mouse Y") * RotationSpeed * Time.deltaTime);

	    transform.rotation = Quaternion.Euler(transform.rotation.eulerAngles.x, transform.rotation.eulerAngles.y, 0);
	}

    private void LookDown(float turnAmount)
    {
        var newRotation = Quaternion.LookRotation(transform.forward + transform.up, transform.up);
        transform.rotation = Quaternion.RotateTowards(transform.rotation, newRotation, turnAmount);
    }

    private void TurnRight(float turnAmount)
    {
        var newRotation = Quaternion.LookRotation(transform.right, transform.up);
        transform.rotation = Quaternion.RotateTowards(transform.rotation, newRotation, turnAmount);
    }


}
