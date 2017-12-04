////////////////////////////////////////////////////////////////
// This script handle lavafalls:                              //
// - producing lavaParticle prefab when needed               //
// - producing lavaShadows gameObject along with lavaParticle //
// < script is cooperating with lavafallShot.js >             //
////////////////////////////////////////////////////////////////
var releaseTime : float = 1.0;    //time after new lavaParticle will be created.
var stuckTime : float = 3.0;      //time to destroy lavaRiver after it has been considered as stuck
var HeightDiff : float = 0.2;     //minimum height that lavaRiver have to cover to not be considered as stuck
var instantiateDelay = 0.2;       //during falling of lavaRiver, time interval between instantiating shadows
var damage : float = 30.0;        //damage that lavaRiver deals to object with health
var lavaParticle : GameObject;    //prefab to instantiate
var soundLoop : GameObject;       //sound when in Lavafall
var particleActualNumber : int=0; //number of actual existing lavaParticle in Lavafall

private var timer : float =0;
private var lavaShadows : GameObject;
function Start()
{
	//assign health system
    InLava.InitInLavaSystem();
	//create shadow gameobject
	lavaShadows = new GameObject();
	lavaShadows.transform.parent = transform;
	lavaShadows.name = "Shadows";
	lavaShadows.layer = gameObject.layer;
	var lavaShadowScript : LavafallShadow = lavaShadows.AddComponent(LavafallShadow);
	lavaShadowScript.damage = damage;
	lavaShadowScript.soundLoop = soundLoop;
	var lavaShadowRigid : Rigidbody = lavaShadows.AddComponent(Rigidbody);
	lavaShadowRigid.isKinematic = true;
	lavaShadowRigid.useGravity = false;
}
function Update () {
	//simple timer
	if (timer>0)
		timer-=Time.deltaTime;
	
	//if timer ended his countdown
	if (timer<=0)
	{
		timer = releaseTime;
		
		//create lavafall shadows - interaction engine
		var lavaShadowObject : GameObject = new GameObject();
		lavaShadowObject.transform.parent = lavaShadows.transform;
		lavaShadowObject.name = "Lava river shadow";
		lavaShadowObject.layer = gameObject.layer;
		
		//create lavaRivers - visual particle
		var lavaRiver = Instantiate(lavaParticle, transform.position, transform.rotation);
		lavaRiver.transform.parent = transform;
		lavaRiver.layer = gameObject.layer;
		//we have to find child of lavariver and assign to it game object layer
		var childrensArray = lavaRiver.GetComponentsInChildren.<SphereCollider>();
		if (childrensArray.Length>1)
		{
			var childSphereCollider = childrensArray[1];
			childSphereCollider.gameObject.layer = gameObject.layer;
		}
		particleActualNumber++;
		var script = lavaRiver.GetComponent(LavafallRiver);
		script.shadowObject = lavaShadowObject;
		script.releaseTime = releaseTime;
		script.instantiateDelay = instantiateDelay;
		script.stuckTime = stuckTime;
		script.HeightDiff = HeightDiff;
	}
}
