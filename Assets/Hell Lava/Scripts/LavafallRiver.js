///////////////////////////////////////////////////////////////////////////
// This script handle lavafalls:                                         //
// - chceck if lavaRiver is stuck                                        //
// - create trace follow shadows                                         //
// < script is cooperating with lavafall.js >                            //
///////////////////////////////////////////////////////////////////////////

var stuckTime : float;         //time to destroy lavaRiver after it has been considered as stuck
var HeightDiff : float;        //minimum height that lavaRiver have to cover to not be considered as stuck
var releaseTime : float;       //time after new lavaParticle will be created.
var instantiateDelay : float;  //delay between instantiating trace follow shadows in seconds
var speed: float;
@HideInInspector
var shadowObject : GameObject; //shadow parent object. Hidden in inspector.

private var rootLavafall : Lavafall;          //script of lavafall to which it belongs 
private var stuckTimer : float;               //timer
private var lastPositionY : float = 0;        //lavaRiver hight at last cycle
private var destroyed : boolean;
private var timer : float;
function Start () {
	rootLavafall = transform.parent.GetComponent.<Lavafall>(); //get parent lavafall script
	stuckTimer = stuckTime;   //set timer
}

function Update () {
	if (destroyed)
		return;
	// instantiate shadow every instantiateDelay sec
	if (timer<=0)
	{
		// creating shadow gameObject, assigning transform parent, name and SphereCollider component
		var shadowPrefab : GameObject = new GameObject();
		shadowPrefab.transform.parent = shadowObject.transform;
		shadowPrefab.name = "shadow";
		shadowPrefab.transform.position = transform.position;
		shadowPrefab.layer = gameObject.layer;
		//shadows will be destroyed every releaseTime sec
		Destroy(shadowPrefab, releaseTime);
		var shadowPrefabCollider : SphereCollider = shadowPrefab.AddComponent.<SphereCollider>();
		shadowPrefabCollider.radius = 4;
		shadowPrefabCollider.isTrigger = true;
		
		timer = instantiateDelay;
	}
	else
		timer-=Time.deltaTime;
	// check if lavaRiver height did change more than HeightDiff
	if ((transform.position.y > lastPositionY+HeightDiff || transform.position.y<lastPositionY-HeightDiff))
		stuckTimer=stuckTime; //launch timer
	
	//countdown
	if (stuckTimer>0)
		stuckTimer-=Time.deltaTime;
	else //countdown has ended
	{
		//LavaRiver is officially stuck. Delete that object.
		rootLavafall.particleActualNumber--;
        Destroy(shadowObject);
        var ps: ParticleSystem.MainModule = gameObject.GetComponent.<ParticleSystem>().main;
		ps.loop = false;
		Destroy(gameObject,ps.startLifetime.constant+1);
		destroyed = true;
	}
	//save height
	lastPositionY = transform.position.y;
}