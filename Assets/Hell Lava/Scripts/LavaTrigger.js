////////////////////////////////////////////////////////////////////////////
// This script handle the lava effect on objects:                         //
// - generates lava splash and steam sound when object in lava            //
// - substract health                                                     //
// - add displacement                                                     //
// - provides some static function for a simpler handling objects in lava //
////////////////////////////////////////////////////////////////////////////
import System.Collections.Generic;

/////
var steamSound : GameObject;        // steam sound prefab phase I
var steamSoundLooped : GameObject;  // steam sound prefab phase II
var steamSoundExit : GameObject;    // steam sound prefab phase III
var LavaSplash : GameObject;        // lava splash prefab
/////
var burningDamage : float;          // burning damage when object in lava per second
var lavaDrag : float;               // assign this value to rigidbody, when entered the lava
var lavaAngularDrag : float;        // assign this value to rigidbody, when entered the lava
/////
var lockTextures : boolean;         // locks fire UI textures if player die in the lava. They wont disappear even if player leave lava after his death.
var steamIfDeath : boolean;         // instantiate constantly looped steam if object have 0 or less HP.
var splashIfDeath : boolean;        // instantiate constantly splash if object have 0 or less HP.
/////
enum RecognitionModeEnum{none, component, layer, tag, name}; 
@HideInInspector
var lavaTransform : Transform; // used to determine lava trigger transform, for other scripts
@HideInInspector
var inLavaObjects : List.<InLava> = new List.<InLava>();  //generic list with all objects present in lava box collider
//Trigger variables
private var surfaceData : MeshData;   // mesh data for sampling lava height on object position

//helpful function to handle players and objects in THIS lava
function ObjectsInLava() //return genetic list with all object, that are in lava.
{
	return inLavaObjects.FindAll(function (IL : InLava)  IL.wholeObject.inLava);
}
function ObjectInLava(object : GameObject) //return InLava object that whole object is equal to given object. If not found, return null.
{
	return inLavaObjects.Find(function (IL : InLava) IL.wholeObject.transform!=null && IL.wholeObject.transform.gameObject == object);
}
function IsPlayerInLava() //return true if found any player that is in lava. Helpful in singleplayer games
{
	var player = inLavaObjects.Find(function (IL : InLava)  IL.wholeObject.isPlayer && IL.wholeObject.inLava);
	if (player!=null)
		return player.wholeObject.inLava;
	else
		return false;
}
function PlayerDiedInLava() //return true if found any player that died in lava. Helpful in singleplayer games
{
	var player = inLavaObjects.Find(function (IL : InLava) IL.wholeObject.isPlayer && IL.wholeObject.lavaDeath);
	if (player!=null)
		return player.wholeObject.lavaDeath;
	else
		return false;
}
function LavaHeightAtPlayer() //return lava height at first player position. Helpful in singleplayer games
{
	var player = inLavaObjects.Find(function (IL : InLava)  IL.wholeObject.isPlayer);
	if (player!=null)
		return player.wholeObject.lavaHeightAtObjects;
	else
		return 0;
}
function LavaHeightAtPlayer(playerObject : GameObject) //return lava height at given player position. Helpful in multiplayer games
{
	var player = inLavaObjects.Find(function (IL : InLava) IL.wholeObject.transform!=null && IL.wholeObject.transform.gameObject == playerObject && IL.wholeObject.isPlayer);
	if (player!=null)
		return player.wholeObject.lavaHeightAtObjects;
	else
		return 0;
}
function IsPlayerInLava(playerObject : GameObject) //return true if found given player that is in lava. Helpful in multiplayer games
{
	var player = inLavaObjects.Find(function (IL : InLava) IL.wholeObject.transform!=null && IL.wholeObject.transform.gameObject == playerObject && IL.wholeObject.isPlayer && IL.wholeObject.inLava);
	if (player!=null)
		return player.wholeObject.inLava;
	else
		return false;
}
function PlayerDiedInLava(playerObject : GameObject) //return true if found given player that died in lava. Helpful in multiplayer games
{
	var player = inLavaObjects.Find(function (IL : InLava) IL.wholeObject.transform!=null && IL.wholeObject.transform.gameObject == playerObject && IL.wholeObject.isPlayer && IL.wholeObject.lavaDeath);
	if (player!=null)
		return player.wholeObject.lavaDeath;
	else
		return false;
}
function PlayersInLava() //return InLava list of all players in lava. Helpful in multiplayer games
{
	var playerList : List.<InLava> = inLavaObjects.FindAll(function (IL : InLava) IL.wholeObject.isPlayer && IL.wholeObject.inLava);
	for (var i =0; i<playerList.Count; i++)
	{
		for (var v =0; v<playerList.Count; v++)
		{
			if (playerList[i].wholeObject.transform.Equals(playerList[v].wholeObject.transform))
				playerList.RemoveAt(i);
		}
	}
	return playerList;
}
function Awake()
{
	//initialize InLava
	InLava.InitInLavaSystem();
	//initialize static lavaTransform
	lavaTransform = transform.Find("Trigger");
}

function Start()
{
	// init global data
	var globalData = ScriptableObject.CreateInstance.<GlobalData>();
	if (!globalData.LoadAsset("", "GlobalData"))
		globalData.DefaultInit();

	if (!PlayerPrefs.HasKey("healthScriptMono"))
		PlayerPrefs.SetString("healthScriptMono", globalData.healthScriptMono);
	if (!PlayerPrefs.HasKey("healthScriptFieldName"))
		PlayerPrefs.SetString("healthScriptFieldName", globalData.healthScriptFieldName);
	if (!PlayerPrefs.HasKey("recognitionIndex"))
		PlayerPrefs.SetInt("recognitionIndex", globalData.recognitionIndex);
	if (!PlayerPrefs.HasKey("recognitionString"))
		PlayerPrefs.SetString("recognitionString", globalData.recognitionString);

	//get lava surface mesh data
	surfaceData = ScriptableObject.CreateInstance.<MeshData>();
	if (!surfaceData.LoadAsset("Meshes", transform.parent.name))
		Debug.LogError(this + ": There is no surface data for gameObject called '" + transform.parent.name + "'. Interaction engine won't work.");
}

function OnTriggerEnter(collider : Collider)
{   
	//if collider is terrain, ignore it
	if (collider.name.Equals(Terrain.activeTerrain.name))
		return;
	
	//if collider is part of a object marked as ignored, ignore it.
    if (collider.GetComponentInParent.<IgnoredObject>() != null)
        return;

	// add whole object to array with all objects that are in lava only, if not added already
	var index = inLavaObjects.FindIndex(function (IL : InLava) IL.transform == collider.transform);
	if (index == -1)
	{
		//temp
		var temp : InLava = new InLava(collider.transform);
		
		var indexWhole = inLavaObjects.FindIndex(function (IL : InLava) IL.wholeObject.transform.Equals(temp.wholeObject.transform));
		//if whole object already exist, assign it reference
		if (indexWhole!=-1)
			temp.wholeObject = inLavaObjects[indexWhole].wholeObject;
		var wholeTemp : InLava = temp.wholeObject;
		temp.wholeObject = wholeTemp;
		//add object
		inLavaObjects.Add(temp);
	}
}
function OnTriggerExit(collider : Collider)
{	
	if (inLavaObjects == null)
        return;
	//find index of collider that is exiting. Remove it from List.
	var index = inLavaObjects.FindIndex(function (IL : InLava) IL.transform == collider.transform);
	if (index != -1 && !inLavaObjects[index].wholeObject.inLava)
	{
		//temps
		var wholeTemp : InLava = inLavaObjects[index].wholeObject;
		//remove splash and loop steam
		var loopedSoundTemp = wholeTemp.transform.Find(steamSoundLooped.name);
		if (loopedSoundTemp!=null)
			loopedSoundTemp.GetComponent.<SoundGenerator>().timedDestroy=-1;
		var splashTemp = wholeTemp.transform.Find(LavaSplash.name);
		if (splashTemp!=null)
			splashTemp.GetComponent.<SplashHandler>().destroy=true;
		//reset object drag
		inLavaObjects[index].resetDisplacement();
		inLavaObjects.RemoveAt(index);
	}
		
}
function FixedUpdate()
{	
	// reset alreadyChecked, list containing whole objects...
	var alreadyChecked = new List.<Transform>();
	// we need to check every object in lava
	for (var i =0; i<inLavaObjects.Count; i++)
	{
		//temp variables for future instantiate
		var loopedSoundTemp : Transform;
		var soundTempExit : Transform;
		var soundTempEnter : Transform;
		var splashTemp : Transform;
		//if object was deleted, remove it from array and continue to next interation
		if (inLavaObjects[i]==null || inLavaObjects[i].transform==null)
		{
			inLavaObjects.Remove(inLavaObjects[i]);
			continue;
		}
		var splashsTemp : SplashHandler[];
		var loopedSoundsTemp : SoundGenerator[];
		//if wholeObject's layer was suddenly changeded to IgnoreTrigCol or IgnoreTrigger, remove it from list.
        if (inLavaObjects[i].wholeObject.transform.gameObject.layer == LayerMask.NameToLayer("IgnoreTrigCol") || inLavaObjects[i].wholeObject.transform.gameObject.layer == LayerMask.NameToLayer("IgnoreTrigger"))
        {
            splashsTemp  = inLavaObjects[i].wholeObject.transform.GetComponentsInChildren.<SplashHandler>();
            loopedSoundsTemp = inLavaObjects[i].wholeObject.transform.GetComponentsInChildren.<SoundGenerator>();
            for(var SH : SplashHandler in splashsTemp)
                SH.GetComponent.<SplashHandler>().destroy = true;
            for (var SG : SoundGenerator in loopedSoundsTemp)
                SG.GetComponent.<SoundGenerator>().timedDestroy = -1;
            inLavaObjects[i].wholeObject.enter = false;
            continue;
        }
		// if object suddenly was marked to be ignored, ignore it.
        if (inLavaObjects[i].transform.GetComponentInParent.<IgnoredObject>()!=null)
        {
            splashsTemp = inLavaObjects[i].wholeObject.transform.GetComponentsInChildren.<SplashHandler>();
			loopedSoundsTemp = inLavaObjects[i].wholeObject.transform.GetComponentsInChildren.<SoundGenerator>();
			for(var SH : SplashHandler in splashsTemp)
				SH.GetComponent.<SplashHandler>().destroy = true;
			for (var SG : SoundGenerator in loopedSoundsTemp)
				SG.GetComponent.<SoundGenerator>().timedDestroy = -1;
			inLavaObjects[i].wholeObject.enter = false;
			continue;
        }
		//create temps for objects in lava
		var temp : InLava = inLavaObjects[i];
		var wholeTemp : InLava = temp.wholeObject;
	
		/////////////////actions on single object all per FixedUpdate///////////////
		
		//chceck lava height at object position, using MeshData SampleHeight
		var data : Vector3= surfaceData.SampleHeight(temp.transform.GetComponent.<Collider>().bounds.center, temp.transform.GetComponent.<Collider>(), this);
		//data.x - mesh height at objects position
		//data.y - if data.z == 0 : distance to lava surface  
		//         if data.z == 1 : distance to complete immersion
		//data.z - 1: object in lava; 0: object not in lava
		//save always highest value of immersion depth
		if (data.z==1 && (wholeTemp.howDeepInLava == 0 || wholeTemp.howDeepInLava<data.y))
			wholeTemp.howDeepInLava = data.y;
		temp.howDeepInLava = data.y;
		//save always highest value of lava height at objects 
		if (wholeTemp.lavaHeightAtObjects == 0 || wholeTemp.lavaHeightAtObjects<data.x)
			wholeTemp.lavaHeightAtObjects = data.x;
		temp.lavaHeightAtObjects = data.x;
		//if object is in lava, mark it
		if (data.z==1)
		{
			wholeTemp.inLava = true;
			temp.inLava = true;
		}
		else
		{
			if (wholeTemp.childCounter==0)
				wholeTemp.inLava = false;
			temp.inLava = false;		
		}
		//we have to check if it is collider first contact with lava
		if (!temp.enter && temp.inLava)
		{
			temp.enter = true;
			//if object is not lava shot, set its drag to simulate lava displacmement
			if (temp.transform.GetComponent.<LavaShot>()==null)
				temp.setDisplacement(lavaDrag, lavaAngularDrag);
			wholeTemp.childCounter++;
		}
		
		//if single object just left the lava
		if (!temp.inLava && temp.enter)
		{
			temp.enter=false;
			temp.resetDisplacement();
			wholeTemp.childCounter--;
		}
	
		/////////////////actions on whole object once per FixedUpdate///////////////
		if (!alreadyChecked.Contains(wholeTemp.transform))
		{					
			//if wholeObject died in lava
			if (wholeTemp.healthScript!=null && wholeTemp.GetHP()<=0 && !wholeTemp.lavaDeath)
			{
				if (lockTextures && wholeTemp.isPlayer)
					wholeTemp.fireUIScript.launch = true;
				wholeTemp.lavaDeath=true;
				
				if (!steamIfDeath)
				{
					//destroy steam loop if exist
					loopedSoundTemp = wholeTemp.transform.Find(steamSoundLooped.name);
					if (loopedSoundTemp!=null)
						loopedSoundTemp.GetComponent.<SoundGenerator>().timedDestroy=-1;
					// if user choosed to not instantiate looped steam sound, play steamSoundExit if died in lava
					soundTempExit = Instantiate(steamSoundExit, temp.transform.position, transform.rotation).transform;
					soundTempExit.transform.parent = wholeTemp.transform;
				}
				if (!splashIfDeath)
				{
					//destroy splash if exist
					splashTemp = wholeTemp.transform.Find(LavaSplash.name);
					if (splashTemp!=null)
						splashTemp.GetComponent.<SplashHandler>().destroy=true;
				}
			}
			if  (wholeTemp.inLava)
			{			
				//deal damage 
				wholeTemp.DealDamage(burningDamage*Time.deltaTime);
				//we have to check if it is whole object first contact with lava
				if (!wholeTemp.enter && wholeTemp.howDeepInLava>0)
				{
					wholeTemp.enter=true;
					//spawn lava enter sound
					soundTempEnter = Instantiate(steamSound, temp.transform.position, transform.rotation).transform;
					soundTempEnter.transform.parent = wholeTemp.transform;
					//spawn steam sound if it is not already spawned
					if (steamIfDeath || wholeTemp.GetHP()>0)
					{	
						loopedSoundTemp = wholeTemp.transform.Find(steamSoundLooped.name);	
						if (loopedSoundTemp==null || (loopedSoundTemp!=null && loopedSoundTemp.GetComponent.<SoundGenerator>().destroy))
						{
							if (loopedSoundTemp!=null)
								loopedSoundTemp.name = loopedSoundTemp.name+"_old";
							loopedSoundTemp = Instantiate(steamSoundLooped, temp.transform.position, transform.rotation).transform;
							loopedSoundTemp.name = steamSoundLooped.name;
							loopedSoundTemp.transform.parent = wholeTemp.transform;
						}
					}
					//spawn lava splash if it is not already spawned
					if (splashIfDeath || wholeTemp.GetHP()>0)
					{
						splashTemp = wholeTemp.transform.Find(LavaSplash.name);
						
						if (splashTemp==null || (splashTemp!=null && splashTemp.GetComponent.<SplashHandler>().destroy))
						{ 
							if (splashTemp!=null)
								splashTemp.name = splashTemp.name+"_old";
							splashTemp = Instantiate(LavaSplash, Vector3(temp.transform.position.x, wholeTemp.lavaHeightAtObjects, temp.transform.position.z), LavaSplash.transform.rotation).transform;
							splashTemp.name = LavaSplash.name;
							splashTemp.transform.parent = wholeTemp.transform;
						}
					}
				}
				//if whole object is under lava
				if (wholeTemp.howDeepInLava<0)
				{
					//destroy lava splash			
					wholeTemp.enter = false;
					splashTemp = wholeTemp.transform.Find(LavaSplash.name);
					if (splashTemp!=null)
						splashTemp.GetComponent.<SplashHandler>().destroy=true;
					//destroy lava steam sound
					loopedSoundTemp = wholeTemp.transform.Find(steamSoundLooped.name);
					if (loopedSoundTemp!=null)
						loopedSoundTemp.GetComponent.<SoundGenerator>().timedDestroy=-1;
				}
			}//if whole object just left lava
			else if (wholeTemp.enter)
			{			
				wholeTemp.enter=false;
				//destroy steam loop
				loopedSoundTemp =wholeTemp.transform.Find(steamSoundLooped.name);
				if (loopedSoundTemp!=null)
					loopedSoundTemp.GetComponent.<SoundGenerator>().timedDestroy=-1;
				//destroy splash
				splashTemp = wholeTemp.transform.Find(LavaSplash.name);
				if (splashTemp!=null)
					splashTemp.GetComponent.<SplashHandler>().destroy=true;
				soundTempExit = Instantiate(steamSoundExit, temp.transform.position, transform.rotation).transform;
				soundTempExit.transform.parent = wholeTemp.transform;
			}
			
			//reset whole objects data
			wholeTemp.howDeepInLava=0;
			wholeTemp.lavaHeightAtObjects=0;
			
			alreadyChecked.Add(wholeTemp.transform);
		}
		
		//save new data
		inLavaObjects[i] = temp;
		inLavaObjects[i].wholeObject = wholeTemp;
	}	
}