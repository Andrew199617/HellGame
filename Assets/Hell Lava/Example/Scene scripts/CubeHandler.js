////////////////////////////////////////////////////////////////
// This script handles cubes in lava:                         //
// - scale cube if in lava                                    //
// - delete it if scale reached 0                             //
////////////////////////////////////////////////////////////////
#pragma strict

var scalingSpeed : float; //meter per sec

@HideInInspector
var LavaTriggerScript : LavaTrigger[]; //filled automatically by FallingCubes script
private var minScale : Vector3 = Vector3(0.1,0.1,0.1);

function Update () {
	var cube: InLava;
	for (var i = 0; i<LavaTriggerScript.Length; i++)
	{
		cube = LavaTriggerScript[i].ObjectInLava(gameObject);
		if (cube != null)
			break;
	}
	if (cube!=null && cube.wholeObject.inLava)
	{
		//scale down cube
		if (transform.localScale.x - scalingSpeed*Time.deltaTime >minScale.x)
			transform.localScale.x -= scalingSpeed*Time.deltaTime;
		else
			transform.localScale.x=minScale.x;
		
		if (transform.localScale.y - scalingSpeed*Time.deltaTime >minScale.y)	
			transform.localScale.y -= scalingSpeed*Time.deltaTime;
		else
			transform.localScale.y=minScale.y;
		
		if (transform.localScale.z - scalingSpeed*Time.deltaTime >minScale.z)	
			transform.localScale.z -= scalingSpeed*Time.deltaTime;
		else
			transform.localScale.z=minScale.z;
		//move cube down, to compensate scaling
			transform.position.y -= scalingSpeed*Time.deltaTime;
		//if cube scale equals 0, delete it
		if (transform.localScale == minScale && transform.childCount==0)
			Destroy(gameObject);
	}
}
function OnTriggerStay(coll : Collider){
}