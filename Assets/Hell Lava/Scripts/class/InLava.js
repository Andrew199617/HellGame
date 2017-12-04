////////////////////////////////////////////////////////////////
// This class represents objects in lava:                     //
// - contains info about object                               //
// - search whole object during creation                      //               
// - manipulates the behaviour of the object on call          //
////////////////////////////////////////////////////////////////
class InLava
{ 
	///////////COLLIDER DATA//////////// 
	var transform : Transform;        // - collider that was detected first
	var objectDrag : float;           // - displacement variables - initial drag
	var objectAngularDrag : float;    // - displacement variables - initial angular drags
	/////////WHOLEOBJECT DATA //////////
	var wholeObject : InLava;         // - whole object
	var healthScript : Component;     // - whole object health script
	var lavaHeightAtObjects : float;  // - lava height at transform position
	var howDeepInLava : float;        // - return object's immersion depth in lava
	var inLava : boolean;             // - is whole object in lava
	var lavaDeath : boolean;          // - does object died in lava
	var isPlayer : boolean;           // - is object a player
	var fireUIScript : FireUI;        // - whole object fire UI script
	var childCounter : int;           // - counter of whole object child still being in lava
	/////////////////FLAGS//////////////
	var enter : boolean;              // -  Is this is first object's contact with lava?
	///////////health variables////////////////////////////////////////////
	private static var HealthScript_type : System.Type;                  // - health script type
	private static var HealthScript_field : System.Reflection.FieldInfo; // - health script current health variable
	private static var initHealthSystemFlag : boolean = false;           // - flag for InitHealthSystem 
	///////////recognition variables //////////////////////////////////////
    private static var recognitionMode : RecognitionModeEnum;            // - recognition mode
    private static var recognitionString : String;                		 // - recognition string
    private static var recognitionComponent : System.Type;               // - type of recognition component
	//METHODS
	//function will initialize health system
	static function InitInLavaSystem()
	{
		if (!initHealthSystemFlag)
		{
		    var blocked : boolean = false;
			var assemblies : System.Reflection.Assembly[] = System.AppDomain.CurrentDomain.GetAssemblies();
			
			recognitionMode = PlayerPrefs.GetInt("recognitionMode", 0);
			recognitionString = PlayerPrefs.GetString("recognitionString", "");
			if (recognitionString != "" && recognitionMode == RecognitionModeEnum.component)
            {
                for (var assemblyName in assemblies)
                {
                    recognitionComponent = assemblyName.GetType(assemblyName.GetName().ToString().Split(","[0])[0] + "." + recognitionString);
                    if (recognitionComponent != null)
                    {
                        if (recognitionComponent.IsSubclassOf(typeof(Component)) || recognitionComponent.IsSubclassOf(typeof(MonoBehaviour)))
                            break;
                        else
                        {
                            recognitionComponent = null;
                            blocked = true;
                        }
                    }

                    recognitionComponent = assemblyName.GetType(recognitionString);
                    if (recognitionComponent != null)
                    {
                        if (recognitionComponent.IsSubclassOf(typeof(Component)) || recognitionComponent.IsSubclassOf(typeof(MonoBehaviour)))
                            break;
                        else
                        {
                            recognitionComponent = null;
                            blocked = true;
                        }
                    }
                }
                if (recognitionComponent == null)
                {
                    recognitionMode = RecognitionModeEnum.none;
                    if (!blocked)
                        Debug.LogError("(InLava): Could not find component of type '" + recognitionString + "'. Recognition system is set to 'None'. ");
                    else
                        Debug.LogError("(InLava): Component of type '" + recognitionString + "' is not allowed. Recognition system is set to 'None'. ");
                }
            }
			
			var healthScriptMono : String = PlayerPrefs.GetString("healthScriptMono", "");
			var healthScriptFieldName : String = PlayerPrefs.GetString("healthScriptFieldName", "");
			if (healthScriptMono!="" && healthScriptMono!=null)
			{			
				for(var assemblyName in assemblies)
				{
					if(assemblyName.GetType(healthScriptMono) != null)
					{
						HealthScript_type = assemblyName.GetType(healthScriptMono);
						HealthScript_field = HealthScript_type.GetField(healthScriptFieldName);
						if (HealthScript_field==null)
						{
							Debug.LogError("(InLava): There is no field called '"+ healthScriptFieldName + "' in "+HealthScript_type+" class. Health system won't work properly.");
							healthScriptMono = null;
						}
						break;
					}
					else
						HealthScript_type = null;
				}
			}
			initHealthSystemFlag = true;
		}
	}
	
	//copy constructor
	function InLava(copy : InLava)
	{
		transform           = copy.transform;
		objectDrag          = copy.objectDrag;
		objectAngularDrag   = copy.objectAngularDrag;
		healthScript        = copy.healthScript;
		lavaHeightAtObjects = copy.lavaHeightAtObjects;
		inLava              = copy.inLava;
		lavaDeath           = copy.lavaDeath;
		isPlayer            = copy.isPlayer;
		fireUIScript       = copy.fireUIScript;
		childCounter        = copy.childCounter;
	}

    // Create already whole object InLava.
    function InLava (transform : Transform, isWholeObject : boolean)
    {
        this.transform = transform;
        wholeObject = this;
        //find health script (can be null)
        if (HealthScript_type != null)
            healthScript = transform.gameObject.GetComponent(HealthScript_type);
        //find fireUI script (can be null)
        fireUIScript = transform.GetComponentInChildren.<FireUI>();
        //if fireUI was found, it's mean whole object is a player
        if (fireUIScript != null)
            isPlayer = true;
    } 
	//create single object InLava
	function InLava(transform : Transform)
	{ 
		this.transform = transform;
		//save info about initial drag if rigid body exist
		if (transform.gameObject.GetComponent.<Rigidbody>()!=null)
		{
			objectDrag = transform.gameObject.GetComponent.<Rigidbody>().drag;
			objectAngularDrag = transform.gameObject.GetComponent.<Rigidbody>().angularDrag;
		}
		//find whole object basing on given parameters
		if (recognitionMode == RecognitionModeEnum.component)
		{
			if (recognitionComponent == null)
                wholeObject = new InLava(transform, true);
            else
            {
                var wholeObjectTemp : Component = transform.GetComponentInParent(recognitionComponent);
                if (wholeObjectTemp != null)
                    wholeObject = new InLava(wholeObjectTemp.transform, true);
                else
                    wholeObject = new InLava(transform, true);
            }
		}
		else if (recognitionMode == RecognitionModeEnum.layer || recognitionMode == RecognitionModeEnum.name || recognitionMode == RecognitionModeEnum.tag)
		{
			var objects : Transform[] = transform.GetComponentsInParent.<Transform>();
			var layerInt : int =  LayerMask.NameToLayer(recognitionString);
			for (var i2=0; i2<objects.Length; i2++)
			{
				if (recognitionMode == RecognitionModeEnum.layer && objects[i2].gameObject.layer == layerInt)
				{
					wholeObject = new InLava(objects[i2], true);
					return;
				}
				if (recognitionMode == RecognitionModeEnum.tag && objects[i2].gameObject.tag == recognitionString)
				{
					wholeObject = new InLava(objects[i2], true);
					return;
				}
				if (recognitionMode == RecognitionModeEnum.name && objects[i2].gameObject.name.Contains(recognitionString))
				{
					wholeObject = new InLava(objects[i2], true);
					return;
				}
			}
			wholeObject = new InLava(transform, true);
		}
		else if (recognitionMode == RecognitionModeEnum.none)//if health script not found, single object is parallel whole object
			wholeObject = new InLava(transform, true);
	} 
	//get whole object HP
	function GetHP()
	{
		var HP : float;
		if (initHealthSystemFlag)
		{
			if (healthScript!=null)
			{
				HP = HealthScript_field.GetValue(healthScript);
				return HP;
			}
			else
				return 0.0f;
		}
		else
			Debug.LogWarning("(InLava): Health system was not initialized. Please use InLava.InitHealthSystem() before using DealDamage function.");
		return 0.0f;
	}
	//deal damage to whole object. If it is player, launch Fire UI for 0.1 sec
	function DealDamage(damage : float)
	{
		if (initHealthSystemFlag)
		{
			if (healthScript!=null)
			{
				var health : float = HealthScript_field.GetValue(healthScript);
				HealthScript_field.SetValue(healthScript,health -damage);
			}
			if (isPlayer)
				fireUIScript.timedLaunch = 0.1;
		}
		else
			Debug.LogWarning("(InLava): Health system was not initialized. Please use InLava.InitHealthSystem() before using DealDamage function.");
	}
	//set object's drag by given values to simulate lava displacement
	function setDisplacement(lavaDrag : float, lavaAngularDrag : float)
	{
		if (transform.gameObject.GetComponent.<Rigidbody>()!=null)
		{
			//remove object velocity if rigid body is kinematic
			if (!transform.gameObject.GetComponent.<Rigidbody>().isKinematic)
				transform.gameObject.GetComponent.<Rigidbody>().velocity = Vector3.zero;
			transform.gameObject.GetComponent.<Rigidbody>().drag =lavaDrag;
			transform.gameObject.GetComponent.<Rigidbody>().angularDrag =lavaAngularDrag;		
		} 
	}
	//reset object drag to initial values
	function resetDisplacement()
	{
		if (transform.gameObject.GetComponent.<Rigidbody>()!=null)
		{
			transform.gameObject.GetComponent.<Rigidbody>().drag =objectDrag;
			transform.gameObject.GetComponent.<Rigidbody>().angularDrag =objectAngularDrag;
		}
	}
}