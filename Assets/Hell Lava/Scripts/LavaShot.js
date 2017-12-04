///////////////////////////////////////////////////////////////////////////
// This script handle lava projectiles behaviour:                         //
// - shot himself (lava projectile) after some period of time            //                                   
// - deals damage to objects with health                                 //
// - play sound when hit an object                                       //
// - launch fire GUI animation if object is player                       //
// - respawn at start position if stuck above the lava                   //                                                           
///////////////////////////////////////////////////////////////////////////
import System.Collections.Generic;
//health variables
var soundEnter : GameObject; //sound played when hit the object
var minTime : float;   //minimal time to projectile launch
var maxTime : float;   //maximal time to projectile launch
var minForce : float;  //minimal launch force
var maxForce : float;  //maximal launch force
var damage : float;    //damage that lava projectile deals
@HideInInspector
var startPosition : Vector3; //projectiles born position

private var LavaHeight : float; //lava height
private var time : float;       //time to launch projectile
private var hitList = new List.<InLava>(); //generic list of objects, that projectile already hit 
function Start () {
	//lava projectile spawn at lava surface, so we can use that to determine lavamesh height
	LavaHeight = transform.position.y;
	//Initializing first time to launch and start position
	time = Random.Range(minTime, maxTime);
	//assign health system
	InLava.InitInLavaSystem();
}

function FixedUpdate () {
	//remove some time
	time -=Time.deltaTime;
	//if timer countdown is over:
	if (time<=0)
	{
		//reset hitList (array with object that already was hit)
		hitList = new List.<InLava>();
		//if above the lava, reset to spawn point
		if (transform.position.y >LavaHeight)
			transform.position = startPosition;
		//launch lava projectile
		GetComponent.<Rigidbody>().AddForce(Vector3(Random.Range(-maxForce/2, maxForce/2), Random.Range(minForce, maxForce), Random.Range(-maxForce/2, maxForce/2)), ForceMode.Impulse);
		//rand next time until launch
		time = Random.Range(minTime, maxTime);
	}
}

function OnTriggerEnter(collider : Collider)
{ 	
	//if projectile fell into lava or touch terrain, ignore it
	var lavaTrigger : LavaTrigger = collider.transform.GetComponent.<LavaTrigger>();
    if (LavaTrigger != null || collider.transform.name == Terrain.activeTerrain.name)
        return;
    //We need to check if collider is not part of object with Health script (like leg or head).
    var objectHit : InLava = new InLava(collider.transform);
	// if from collider already was not subtracted health, subtract it.
	if (!hitList.Contains(objectHit))
	{
		hitList.Add(objectHit);
		// remove amount of health
		objectHit.wholeObject.DealDamage(damage);
		//launch fire gui for 1 sec
		if (objectHit.wholeObject.fireUIScript!=null)
			objectHit.wholeObject.fireUIScript.timedLaunch = 1;
		//spawn sound on enter
		var soundTempEnter : Transform = Instantiate(soundEnter, objectHit.transform.position, transform.rotation).transform;
		soundTempEnter.transform.parent = objectHit.transform;
	}
}