using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class FirstPersonCamera : MonoBehaviour
{

    public float RotationSpeed;

    private float PercentageICanLookUp = .9f;

    public float JumpLength = .5f;
    private float deltaTime;
    private float yBeforeJump;
    private bool inAir;

    // Update is called once per frame
    void Update ()
	{
	    //Mouse Y might need to be diffrent for headset.
        LookDown(Input.GetAxis("Mouse Y") * RotationSpeed);

	    transform.rotation = Quaternion.Euler(transform.rotation.eulerAngles.x, transform.rotation.eulerAngles.y, 0);

	    SelectMenuButton();

	    deltaTime += Time.deltaTime;
        //JumpPressed
	    if (Input.GetKeyDown(KeyCode.Space) && !inAir)
	    {
	        yBeforeJump = transform.position.y;
	        inAir = true;
	        deltaTime = 0;
	    }

        else if (Input.GetKey(KeyCode.Space) && deltaTime < JumpLength && inAir)
	    {
            Jump();
	    }
        //Fall 
        else if (inAir)
        {
	        transform.position -= Vector3.up * 10 * Time.deltaTime;
            if (transform.position.y <= yBeforeJump)
            {
                transform.position = new Vector3(transform.position.x, yBeforeJump, transform.position.z);
                inAir = false;
                deltaTime = 0;
            }
        }
    }

    private void SelectMenuButton()
    {
        Ray ray = new Ray(transform.position,Camera.main.transform.forward);
        var allHits = Physics.RaycastAll(ray, 500);

        foreach (var hit in allHits)
        {
            var button = hit.transform.GetComponent<Button>();
            if (button)
            {
                var gameManager = FindObjectOfType<GameManager>();
                gameManager.OpenGame();
            }
        }
    }

    public void Jump()
    {
        transform.position += Vector3.up * 10 * Time.deltaTime;
    }

    private void LookDown(float turnAmount)
    {
        //y = 1
        if (Math.Abs(transform.forward.y)  <= PercentageICanLookUp)
        {
            var newRotation = Quaternion.LookRotation(transform.forward + transform.up, transform.up);
            transform.rotation = Quaternion.RotateTowards(transform.rotation, newRotation, turnAmount);
        }
        else
        {

            var newRotation = Quaternion.LookRotation(new Vector3(transform.forward.x, 
                transform.forward.y > 0 ? PercentageICanLookUp - .0001f : -PercentageICanLookUp + .0001f, transform.forward.z),
                transform.up);

            transform.rotation = Quaternion.RotateTowards(transform.rotation, newRotation, Math.Abs(turnAmount));
        }
    }


}
