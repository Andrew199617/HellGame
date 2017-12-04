////////////////////////////////////////////////////////////////
// This script destroys the sound:                            //
// - destroy object when playing is over                      //
////////////////////////////////////////////////////////////////
#pragma strict

function Update () 
{
	if (!GetComponent.<AudioSource>().isPlaying)
 		Destroy(gameObject);
}