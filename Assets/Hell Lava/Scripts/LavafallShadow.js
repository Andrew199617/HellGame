//////////////////////////////////////////////////////////////////////////////////////
// This script is responsible for capture data from shadow colliders and use them:  //
// - remove health                                                                  //
// - play sound when stay                                                           //
// - launch fire GUI animation if object is a player                                //
//////////////////////////////////////////////////////////////////////////////////////
import System.Collections.Generic;
var damage : float;          //amount of damage in one second, that will be delayed to object
var soundLoop : GameObject;  //sound on lavafall stay 

private var soundLoopCopy: GameObject;

function OnTriggerStay (collider : Collider)
{
	//ignore lava surface, terrain, lava projectile and himself
    var lavaTrigger : LavaTrigger = collider.transform.GetComponent.<LavaTrigger>();
    if (lavaTrigger != null || collider.transform.name == Terrain.activeTerrain.name)
        return;
    //create new object of type InLava
    var inLavaObject : InLava = new InLava(collider.transform);
    //deal damage
	inLavaObject.wholeObject.DealDamage(damage*Time.deltaTime);
	//spawn loop sound
    if (soundLoopCopy == null)
        soundLoopCopy = Instantiate(soundLoop, collider.transform.position, transform.rotation);
	//destroy loop using internal SoundGenerator function
    soundLoopCopy.GetComponent(SoundGenerator).timedDestroy=0.5;
}