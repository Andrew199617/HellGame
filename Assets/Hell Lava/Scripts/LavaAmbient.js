///////////////////////////////////////////////////////////////////////////////////////////
// This script handle the lava ambient. Every object with this script attached will      //
// "hear" lava ambient                                                                   //
// - change ambient volume depends on object distance to lava                            //
// - checks if object is close to lava                                                   //
///////////////////////////////////////////////////////////////////////////////////////////

var maxVolume : float = 0.02; //max value of volume
var distance : float = 30;    //distance after which lava ambience will be audible
private var LavaTriggerScripts : LavaTrigger[];
private var componentAudio : AudioSource;
function Start () {
	//set at start AudioSource volume to 0
	LavaTriggerScripts = FindObjectsOfType.<LavaTrigger>();
	componentAudio = gameObject.GetComponent.<AudioSource>();
	componentAudio.volume=0;
}

function Update () {
	//if lava surface even exist
	var smallestDistance : float = distance;
	for (var i=0; i<LavaTriggerScripts.Length; i++)
	{
		//update data
		if (LavaTriggerScripts[i]==null)
			continue;
		var coll : Collider = LavaTriggerScripts[i].lavaTransform.parent.GetComponent.<MeshCollider>();
	
		//calculate volume based on object distance to lava surface
		var tempVector3 : Vector3 = coll.ClosestPointOnBounds(transform.position);
		var newDistance = Vector3.Distance(tempVector3, transform.position);
		if (newDistance <= smallestDistance)
			smallestDistance = newDistance;
	}
	if (smallestDistance <= distance)
			componentAudio.volume = maxVolume*(1 - smallestDistance/distance);
}