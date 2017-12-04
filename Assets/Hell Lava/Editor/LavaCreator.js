import System.Collections.Generic;
import System.Linq;
import UnityEngine.UI;
import UnityEngine.SceneManagement;
//auxiliary class for layer tool
class LayerToolClass {
	
	var gameObject : GameObject; //game object
	var index : int;             //index of selected layer form popup menu
	//default constructor
	function LayerToolClass()
	{
		gameObject = null;
		index = 0;
	}
	//initialized constructor
	function LayerToolClass(gameObject : GameObject)
	{
		this.gameObject = gameObject;
		index = 0;
	}
	
}
class LavaCreator extends EditorWindow  {
	//main variables
	static var parentObject : GameObject; // Main object, to which you will assign lava
	var generate : boolean = false;       // generate button variable
	var save : boolean = false;           // save button variable
	var newLava : boolean = false;        // create new lava button variable
	
	var terrain : Terrain;                // Terrain, to which you will assign lava
	var material : Material;              // lava material
	var healthScriptMono : String;        // monoscript type
	var healthScriptFieldName : String;   // health script variable name, that defines current object HP   
	var width : int;			          // lava mesh width
	var height : int;                     // lava mesh height
	var dist : float;                     // distance between two vertices. Set value to this variable different than 0, if you don't want to let it calculate automatically
	
	//features variables
	var assignLight : boolean = false;         // if true, lights will be assigned to generated lava
	var assignProjectiles : boolean = false;   // if true, lava projectiles will be assigned to generated lava
	var assignSparkles : boolean = false;      // if true, fumes will be assigned to generated lava
	var assignTrigger : boolean = false;       // if true, interaction engine will be assigned to generated lava
	var assignCollider : boolean = false;      // if true, lava blockade will be assigned to generated lava
	var assignLayers : boolean = false;   	   // if true, layers will be assigned to project
	var assignIgnoredObjects : boolean = false;// if true, all ignored object will have attached IgnoredObject script
	var addFireUI : boolean = false;           // if true, FireUI will be added to scene
	var roundStep : float; 		      	  // Step between degrees. Less mean more precision but it takes more time to generate lava surface
	var antialiasingLevel : int;          // antialiasing level. Usually 50 is enough. 
	var steepness : float;                // lava lift steepnes. Lower value mean lower steepnes. 1 is default
	var lavaElevation : float;            // the value of which lava will be raised at the terrain shore
	var autoDist : boolean;               // calc distance automatically?	
	var collideInitY : float = -2.5f;     // initial Y value for lava collider 
	var steamSoundEnter : GameObject;     // steam sound on enter prefab 
	var steamSoundStay : GameObject;      // steam sound on stay prefab 
	var steamSoundExit : GameObject;      // steam sound on exit prefab 
	var recognitionIndex : int;    	  	  // index of choosed recognition mode
	var recognitionString : String;		  // string by which recognition system will recognise whole object
	var lavaSplash : GameObject;          // splash prefab
	var burningDamage : float = 30f;      // damage per second when in lava
	var lavaDrag : float = 20;            // drag that will be assigned to object to simulate displacement
	var lavaAngularDrag : float = 20;     // angular drag that will be assigned to object to simulate displacement  
	var lockTextures : boolean = true;    // interaction engine option    
	var steamIfDeath : boolean = true;    // interaction engine option   
	var splashIfDeath : boolean = true;   // interaction engine option
	var SpaceBetweenLights : int = 30;       //space between lights
	var numberOfProjectiles : int = 30;      //how many should be lava projectiles
	var soundOfProjectiles : GameObject;     //sound on projectile collision with object
	var projectilesTime : Vector2 = Vector2(5,20);           //time between new launch rand form x to y
	var projectilesForce : Vector2 = Vector2(10,20);          //launch force rand form x to y
	var projectilesDmg : float = 5;              //projectile damage on touch
	var numberOfSparkles : int = 30;         //how many should be fumes at one time on lava surface
	var speedMainTex : float = 1;            //how fast should lava texture scrolling
	var speedShoreTex : float = 0.1;         //how fast should lava texture scrolling
	var angleDirection : float = 0;          //how fast should lava texture scrolling
	var lavaWavesDuration : float = 6;       //how long should be duration of one lava wave [sec]
	var lavaWavesAmplitude : float = 1.5;    //how high should be lava waves [m]
	var lightPrefab : GameObject;            //prefab, that will be used to generate lights
	var projectilesPrefab : GameObject;      //prefab, that will be used to instantiate lava projectiles
	var sparklePrefab : GameObject;          //prefab, that will be used to instantiate sparkles
	//editor variables
	private static var loadSaves : boolean = true;
	private var surfData : MeshData;
	private var globalData : GlobalData;
	private var oldParentObject : GameObject;
	private var HealthScript_fields : System.Reflection.FieldInfo[]; 
	private var HealthScript_type : System.Type;  
	private var HealthScript_fieldsStr : String[]; 
	
	private var advancedConfiguration : boolean;
	
	//array for recognition system
	private var recognitionPopup : String[] = ["none",
											   "component",
				  		   		     		   "layer",
				  		   	 		 		   "tag",
				  		   			 		   "name"];
	private var recognitionIndexOld : int=-1;
	//array for Hell Lava layers name
	private var layers : String[] = ["LavaTrigger",
				  		   		     "LavaCollider",
				  		   	 		 "IgnoreTrigCol",
				  		   			 "IgnoreCollider",
				 		   			 "IgnoreTrigger",
						   			 "Lava"];
	private var autoDistLast : boolean;
	private var tempDist : float = 1;
	private var layerConfSize : int=layers.length; 
	private var IgnoreObjectsSize : int;
	private var assignLayersArr = layers;
	private var numberOfLayers : int;
	private var assignLayersConfArr : int[];
	private var layerCollidConfSize : int;
	private var finalLayerArray : String[] = new String[0];
	private var finalLayerArrayWithoutAll : String[] = new String[0];
	private var layerPrefabConfSize : int;
	private var layerPrefabArray : LayerToolClass[];
    private var recognitionComponentStatus : String;
    private var globalsSaveStatus : String;
    private var changeFlag : boolean;
    private var unsavedChanges : boolean;
	private var errorMessage : String;
	private var infoMessage : String;
	private var scrollPos : Vector2;
	private var assemblies : System.Reflection.Assembly[];
	private var featureErrorInfo : String[];
	private var ignorePrefabsArr : GameObject[];
    private var ignoreObjectArr : GameObject[];
	private var allIgnoredObjects : IgnoredObject[];
	private var ignoreObjectsSize : int;
    private var ignorePrefabsSize : int;
	
	private var lastFocusedControll : String;
    private var enter : boolean;
	
	private var assignTrigger_foldout : boolean;	
	private var assignCollider_foldout : boolean;
	private var assignLight_foldout : boolean;
	private var assignProjectiles_foldout : boolean;
	private var assignSparkles_foldout : boolean;
	private var assignLayers_foldout : boolean;
	private var assignIgnoredObjects_foldout : boolean;
	private var addFireUI_foldout : boolean;
	
	private var generateHigh : boolean = false;
	private var saveHigh : boolean = false;
	private var newLavaHigh : boolean = false;
	private var assignLightHigh : boolean = false;
	private var assignProjectilesHigh : boolean = false;
	private var assignSparklesHigh : boolean = false;
	private var assignTriggerHigh : boolean = false;
	private var assignColliderHigh : boolean = false;
	private var assignLayersHigh : boolean = false;
	private var addFireUIHigh : boolean = false;
	//where creator window should be placed
	@MenuItem("GameObject/Create Other/Lava environment")
	//initialization of the window
	static function Init () {
		var creator = EditorWindow.GetWindow(typeof(LavaCreator)) as LavaCreator;
		creator.titleContent = GUIContent("Lava creator");	
		loadSaves = false;	
	}
	function Awake()
    {
        ignoreObjectsSize = -1;
        ignorePrefabsSize = -1;

        layerConfSize = layers.Length;
        assignLayersArr = layers;
        numberOfLayers = CountLayers(layers) + 1;
        // collisions between layers that need to be disselected
        assignLayersConfArr =           [numberOfLayers + 0, numberOfLayers + 4,
                                         numberOfLayers + 1, numberOfLayers + 3,
                                         numberOfLayers + 0, numberOfLayers + 2,
                                         numberOfLayers + 1, numberOfLayers + 2,
                                         numberOfLayers + 2, numberOfLayers + 2,
                                         numberOfLayers + 2, numberOfLayers + 3,
                                         numberOfLayers + 1, numberOfLayers + 0,
                                         numberOfLayers + 5, 0];

        layerCollidConfSize = assignLayersConfArr.Length / 2;

        globalData = ScriptableObject.CreateInstance.<GlobalData>();
        if (!globalData.LoadAsset("", "GlobalData"))
        {
        	globalData.CreateAsset("Assets/Hell Lava/Resources/", "GlobalData");
        	globalData.DefaultInit();
       	}
    }
	function OnDestroy()
	{
	    if (unsavedChanges && EditorUtility.DisplayDialog("Warning!", "There are unsaved changes in global settings. Save them?", "Save", "Abort"))
	        SaveGlobals();
		if (parentObject!=null)
		{
			//save gloabl data
			var surfData : MeshData = ScriptableObject.CreateInstance.<MeshData>();
			surfData.LoadAsset("Meshes/",parentObject.name);
			surfData.Terrain(terrain);
			surfData.material = material;
			surfData.width = width;
			surfData.height = height;
			surfData.dist = dist;
					
			surfData.roundStep = roundStep;
			surfData.antialiasingLevel = antialiasingLevel;
			surfData.steepness = steepness;
			surfData.lavaElevation = lavaElevation;
			surfData.autoDist = autoDist;
			
			surfData.CreateAsset("Assets/Hell Lava/Resources/Meshes/", parentObject.name);
			DestroyImmediate(surfData,false);
		}
	}
	function OnEnable()
	{

		if (globalData == null)
		{
			globalData = ScriptableObject.CreateInstance.<GlobalData>();
	        if (!globalData.LoadAsset("", "GlobalData"))
	        {
	        	globalData.CreateAsset("Assets/Hell Lava/Resources/", "GlobalData");
	        	globalData.DefaultInit();
	       	}
       	}
		
		ignoreObjectsSize = -1;
        lastFocusedControll = GUI.GetNameOfFocusedControl();
		
		healthScriptMono = globalData.healthScriptMono;
        healthScriptFieldName = globalData.healthScriptFieldName;
        recognitionIndex = globalData.recognitionIndex;
        recognitionString = globalData.recognitionString;

		if (EditorPrefs.HasKey("parentObject"))
			parentObject = GameObject.Find(EditorPrefs.GetString("parentObject"));
		recognitionIndexOld = recognitionIndex;
		EditorApplication.playmodeStateChanged = HandleOnPlayModeChanged;
		finalLayerArrayWithoutAll = new String[0];
		finalLayerArrayWithoutAll = finalLayerArrayWithoutAll.Concat(GetLayerArray(assignLayersArr)).ToArray();
		finalLayerArrayWithoutAll = finalLayerArrayWithoutAll.Concat(assignLayersArr).ToArray();
		layerPrefabArray = InitObjectArray(finalLayerArrayWithoutAll);
		layerPrefabConfSize = layerPrefabArray.Length;
		
		if (steamSoundEnter==null) steamSoundEnter = Resources.Load("Prefabs/steamSoundEnter", GameObject);      //prefab, that will be used to generate lava sound on enter
		if (steamSoundStay==null) steamSoundStay = Resources.Load("Prefabs/steamSoundLooped", GameObject);       //prefab, that will be used to generate lava sound on stay
		if (steamSoundExit==null) steamSoundExit=  Resources.Load("Prefabs/steamSoundExit", GameObject);         //prefab, that will be used to generate lava sound on exit
		if (lavaSplash==null) lavaSplash = Resources.Load("Prefabs/lavaSplash", GameObject);                     //prefab, that will be used to generate lava splash
		if (soundOfProjectiles==null) soundOfProjectiles= Resources.Load("Prefabs/steamSoundEnter", GameObject); //sound on projectile collision with object
		if (lightPrefab==null) lightPrefab= Resources.Load("Prefabs/pointLight", GameObject);             		 //prefab, that will be used to generate lights
		if (projectilesPrefab==null) projectilesPrefab= Resources.Load("Prefabs/lavaShot", GameObject);          //prefab, that will be used to instantiate lava projectiles
		if (sparklePrefab==null) sparklePrefab= Resources.Load("Prefabs/sparkles", GameObject);                  //prefab, that will be used to instantiate smoke 
	}
	function HandleOnPlayModeChanged()
 	{
 		// update object list for Layer Tools on game launch and exit
 		if (!EditorApplication.isPlaying)
 		{
 			if (parentObject!=null)
			{
				var transform = parentObject.transform;
				var path : String = transform.name;
			    while (transform.parent != null)
			    {
			        transform = transform.parent;
			        path = transform.name + "/" + path;
			    }
				EditorPrefs.SetString("parentObject",path);	
			} 
			else
				EditorPrefs.DeleteKey("parentObject");
 		 	layerPrefabArray = InitObjectArray(finalLayerArrayWithoutAll);
 		}
 	}
	// here we go with whole visual part
	function OnGUI () {
		var e : Event = Event.current;
        if ((GUI.GetNameOfFocusedControl() != lastFocusedControll && lastFocusedControll!="") || e.keyCode == KeyCode.Return)          
            enter = true;        
		
        lastFocusedControll = GUI.GetNameOfFocusedControl();
		//initialization of variables when window first launch
		scrollPos = EditorGUILayout.BeginScrollView(scrollPos, GUIStyle.none);
		
		EditorGUILayout.LabelField("This creator will help you generate lava environment.", EditorStyles.helpBox);
		EditorGUILayout.LabelField("");
		EditorGUILayout.LabelField("Global configuration " + globalsSaveStatus, EditorStyles.boldLabel);
		EditorGUI.indentLevel++;
			EditorGUILayout.LabelField("- Health script");
			EditorGUI.indentLevel++;
			healthScriptMono = EditorGUILayout.TextField(GUIContent("Health MonoScript", "Type here your health script name (case sensitive!). Leave this field empty, if you don't want health functionality."), healthScriptMono);
			if (healthScriptMono != globalData.healthScriptMono)
			    changeFlag = true;
			if (healthScriptMono!=null && healthScriptMono!="")
			{
			    assemblies = System.AppDomain.CurrentDomain.GetAssemblies();
			    for(var assemblyName in assemblies)
			    {
			        if(assemblyName.GetType(healthScriptMono) != null)
			        {
			            HealthScript_type = assemblyName.GetType(healthScriptMono);
			            break;
			        }
			        else
			        	HealthScript_type = null;
			    }
			    if (HealthScript_type!=null)
				{
					var selectIndex : int = 0;
					HealthScript_fields = HealthScript_type.GetFields();	
					HealthScript_fieldsStr = new String[HealthScript_fields.length];
					for (var i=0; i<HealthScript_fields.length; i++)
					{
						HealthScript_fieldsStr[i] = HealthScript_fields[i].Name;
						if (healthScriptFieldName == HealthScript_fieldsStr[i])
                            selectIndex = i;
					}
					healthScriptFieldName = HealthScript_fieldsStr[EditorGUILayout.Popup("HP field name", selectIndex, HealthScript_fieldsStr)];
					if (healthScriptFieldName != globalData.healthScriptFieldName)
					    changeFlag = true;
				}
				else
				{
					HealthScript_fieldsStr= new String[1];
					HealthScript_fieldsStr[0] = "";
					GUI.enabled = false;
					EditorGUILayout.Popup("HP field name", 0, HealthScript_fieldsStr);
					GUI.enabled = true;
				}
			}
			else
			{
				HealthScript_fieldsStr= new String[1];
				HealthScript_fieldsStr[0] = "";
				GUI.enabled = false;
				EditorGUILayout.Popup("HP field name", 0, HealthScript_fieldsStr);
				GUI.enabled = true;
			}
			EditorGUI.indentLevel--;
			EditorGUILayout.LabelField("- Whole object recognition system");
			EditorGUI.indentLevel++;
			    recognitionIndex = EditorGUILayout.Popup("Recognize by: ",recognitionIndex, recognitionPopup);
			    if (recognitionIndex != globalData.recognitionIndex)
			        changeFlag = true;
				if (recognitionIndexOld != recognitionIndex)
				{
					recognitionIndexOld = recognitionIndex;
					recognitionString = "";
				}
				if (recognitionIndex==0)
				{
					recognitionString = "";
				}
				if (recognitionIndex==1)
				{					
				    recognitionString = EditorGUILayout.TextField(new GUIContent("Component name:", "Type here name of the component (case sensitive!), by which recognize system should find whole object."), recognitionString);
				    
				    assemblies = System.AppDomain.CurrentDomain.GetAssemblies();
				    if (recognitionString != "" && recognitionString!=null)
				    {
				        var blocked : boolean = false;
				        var recognitionComponent : System.Type = null;
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
				            if (!blocked)
				                recognitionComponentStatus = "Type not recognized...";
				            else
				                recognitionComponentStatus = "Type not allowed!";
				        }
				        else
				            recognitionComponentStatus = "Type has been found!";
				    } else recognitionComponentStatus = "Type component type name.";
                    EditorGUILayout.BeginHorizontal();
                    EditorGUILayout.LabelField("");
                    EditorGUILayout.LabelField(recognitionComponentStatus);
                    EditorGUILayout.EndHorizontal();
                }
			    if (recognitionIndex==2)
				{
					if (recognitionString=="")
						recognitionString="Default";
					recognitionString = LayerMask.LayerToName(EditorGUILayout.LayerField("Select layer: ", LayerMask.NameToLayer(recognitionString))); 
				}
				if (recognitionIndex==3)
					recognitionString = EditorGUILayout.TagField(GUIContent("Select tag: ") , recognitionString);
				if (recognitionIndex==4)
					recognitionString = EditorGUILayout.TextField(GUIContent("Type name: ","Recognition system will search whole object in it's name (or part) by given string"), recognitionString);
				if (recognitionString != globalData.recognitionString)
				    changeFlag = true;
				EditorGUILayout.LabelField("");
				EditorGUILayout.BeginHorizontal();
				EditorGUILayout.LabelField(" ");
				save = GUILayout.Button("Save");
				if (save && !saveHigh)
					saveHigh = true;
				EditorGUILayout.EndHorizontal();
				EditorGUI.indentLevel--;	
				if (changeFlag)
				{
				    globalsSaveStatus = "(* new changes *)";
				    unsavedChanges = true;
				}
				else
				{
				    globalsSaveStatus = "";
				    unsavedChanges = false;
				}
				changeFlag = false;
		EditorGUI.indentLevel--;
		
		EditorGUILayout.LabelField("Lava surface generator", EditorStyles.boldLabel);
		EditorGUI.indentLevel++;
		EditorGUILayout.BeginHorizontal();
		parentObject = EditorGUILayout.ObjectField("- Parent Object", parentObject, GameObject, true);
		//check if parent object has changed
		if (parentObject!=null && !parentObject.Equals(oldParentObject))
		{
			oldParentObject = parentObject;
			loadSaves = false;
		}
		//show only labels if parent object is null
		if (parentObject==null)
		{
			errorMessage = "";
			infoMessage = "";
			newLava = GUILayout.Button("New");
            if (newLava && !newLavaHigh)
                newLavaHigh = true;
            EditorGUILayout.EndHorizontal();
			loadSaves = false;
			EditorGUILayout.LabelField("You need to assign from scene lava parent object or create new one.", EditorStyles.helpBox); 
		}//show only labels if parent object is not present on scene
		else if (EditorUtility.IsPersistent(parentObject))
		{
			errorMessage = "";
			infoMessage = "";
			newLava = GUILayout.Button("New");
            if (newLava && !newLavaHigh)
                newLavaHigh = true;
            EditorGUILayout.EndHorizontal();
			loadSaves = false;
			EditorGUILayout.HelpBox("Object must be alive at scene!", MessageType.Error, true);
		}
		else //else load whole fields and features
		{
			EditorGUILayout.EndHorizontal();
			if (!loadSaves)
			{
				errorMessage = "";
				infoMessage = "";
				if (surfData==null)
				{			
					surfData = ScriptableObject.CreateInstance.<MeshData>();
					if (!surfData.LoadAsset("Meshes/",parentObject.name))
					{
						Debug.Log(this + ": Loaded default config.");  
						surfData.DefaultInit();
					}
					terrain = surfData.Terrain();
					material = surfData.material;
					width = surfData.width;
					height = surfData.height;
					dist = surfData.dist;
								
					roundStep = surfData.roundStep;
					antialiasingLevel = surfData.antialiasingLevel;
					steepness = surfData.steepness;
					lavaElevation = surfData.lavaElevation;
					autoDist = surfData.autoDist;
					autoDistLast = autoDist;
					DestroyImmediate(surfData);
				}
				loadSaves = true;
			}
			terrain = EditorGUILayout.ObjectField("- Terrain", terrain , Terrain, true);
			material = EditorGUILayout.ObjectField("- Material", material, Material, false);			
			
				EditorGUILayout.LabelField("- Lava size");
				EditorGUI.indentLevel++;
						width = EditorGUILayout.IntField("Width", width);
						height = EditorGUILayout.IntField("Height", height);
				EditorGUI.indentLevel--;
				lavaElevation = EditorGUILayout.FloatField(GUIContent("- Lava elevation", "Determining how high should lava mesh supposed to be lifted at border with terrain."),lavaElevation);
				EditorGUILayout.BeginHorizontal();
					GUI.enabled = !autoDist;
					dist = EditorGUILayout.FloatField(GUIContent("- Distance","Distance between vertices. Check 'auto' to calculate this value automatically"), dist);
					GUI.enabled = true;
					autoDist = EditorGUILayout.ToggleLeft("Calc auto", autoDist);
				EditorGUILayout.EndHorizontal();
				advancedConfiguration = EditorGUILayout.Foldout(advancedConfiguration, "Advanced configuration");
				if (advancedConfiguration)
				{
					EditorGUI.indentLevel++;
						roundStep = EditorGUILayout.Slider(GUIContent("- Round step", "For every creating vertex is checked if he is close to terrain. This is done by shooting ray around examined vertex at a certain angle. This value is determining that “certain angle”"),roundStep, 0.1, 90);
						antialiasingLevel = EditorGUILayout.IntField(GUIContent ("- Antialiasing level", "Determine antialiasing level for smoothing lifted edges."), antialiasingLevel);
						steepness = EditorGUILayout.Slider(GUIContent("- Steepness level", "Lava lift steepness. Lower value mean gentler steepness, bigger sharper"),steepness, 0.5, 2);
					EditorGUI.indentLevel--;
				}
				if (!String.IsNullOrEmpty(errorMessage))
					EditorGUILayout.HelpBox(errorMessage, MessageType.Error, true);
				else if (!String.IsNullOrEmpty(infoMessage))
					EditorGUILayout.HelpBox(infoMessage, MessageType.Info, true);
				EditorGUILayout.BeginHorizontal();            
				EditorGUILayout.LabelField(" ");
				generate = GUILayout.Button("Generate");
				EditorGUILayout.EndHorizontal();
				if (generate && !generateHigh)
					generateHigh = true;
			EditorGUI.indentLevel--;
			
			EditorGUILayout.LabelField("Features handler", EditorStyles.boldLabel);	
			EditorGUI.indentLevel++;
				EditorGUILayout.BeginHorizontal();
					assignTrigger_foldout = EditorGUILayout.Foldout(assignTrigger_foldout, "Lava interaction engine");				
					assignTrigger = GUILayout.Button("Assign");
					if (assignTrigger && !assignTriggerHigh)
						assignTriggerHigh = true;
				EditorGUILayout.EndHorizontal();
				if (assignTrigger_foldout)
				{
					EditorGUI.indentLevel++;
					burningDamage =  EditorGUILayout.FloatField(GUIContent ("- Burning Damage", "Burning damage per second delayed by lava to object with health script"), burningDamage);
					lavaDrag = EditorGUILayout.Slider(GUIContent("- Lava drag", "Defines object displacement in lava."),lavaDrag, 0, 100);
					lavaAngularDrag = EditorGUILayout.Slider(GUIContent("- Lava angular drag", "Defines object angular displacement in lava."),lavaAngularDrag, 0, 100);
					lockTextures = EditorGUILayout.Toggle(GUIContent("- Lock textures", "Locks fire GUI textures if player die in the lava. They wont disappear even if player leave lava after his death."),lockTextures);
					steamIfDeath = EditorGUILayout.Toggle(GUIContent("- Steam if death", "Instantiate constantly looped steam even if object have 0 or less HP."),steamIfDeath);
					splashIfDeath = EditorGUILayout.Toggle(GUIContent("- Splash if death", "Instantiate constantly splash even if object have 0 or less HP."),splashIfDeath);	
					EditorGUILayout.LabelField("___________________");
					EditorGUILayout.LabelField("- Steam sound");	
					EditorGUI.indentLevel++;
						steamSoundEnter = EditorGUILayout.ObjectField("On enter", steamSoundEnter, GameObject, false);
						steamSoundStay = EditorGUILayout.ObjectField("On stay", steamSoundStay, GameObject, false);
						steamSoundExit = EditorGUILayout.ObjectField("On exit", steamSoundExit, GameObject, false);
					EditorGUI.indentLevel--;
					lavaSplash = EditorGUILayout.ObjectField("- Lava splash", lavaSplash, GameObject, false);
					EditorGUI.indentLevel--;
				}
				EditorGUILayout.BeginHorizontal();
					assignCollider_foldout = EditorGUILayout.Foldout(assignCollider_foldout, "Sink blockade");				
					assignCollider = GUILayout.Button("Assign");
					if (assignCollider && !assignColliderHigh)
						assignColliderHigh = true;
				EditorGUILayout.EndHorizontal();
				if (assignCollider_foldout)
				{
					EditorGUI.indentLevel++;
						collideInitY =  EditorGUILayout.FloatField(GUIContent (" - Block at height", "Initial value for collider.position.y"), collideInitY);
					EditorGUI.indentLevel--;
				}
				EditorGUILayout.BeginHorizontal();
					assignLight_foldout = EditorGUILayout.Foldout(assignLight_foldout, "Lava lighting");				
					assignLight = GUILayout.Button("Assign");
					if (assignLight && !assignLightHigh)
						assignLightHigh = true;
				EditorGUILayout.EndHorizontal();
				if (assignLight_foldout)
				{
					EditorGUI.indentLevel++;
					lightPrefab = EditorGUILayout.ObjectField("- Light prefab", lightPrefab, Object, true);
					SpaceBetweenLights = EditorGUILayout.IntField(GUIContent("- Distance","Distance between light points."), SpaceBetweenLights);
					EditorGUI.indentLevel--;
				}
				EditorGUILayout.BeginHorizontal();
					assignProjectiles_foldout = EditorGUILayout.Foldout(assignProjectiles_foldout, "Lava projectiles");
					assignProjectiles = GUILayout.Button("Assign");
					if (assignProjectiles && !assignProjectilesHigh)
						assignProjectilesHigh = true;
				EditorGUILayout.EndHorizontal();
				if (assignProjectiles_foldout)
				{
					EditorGUI.indentLevel++;
					projectilesPrefab = EditorGUILayout.ObjectField("- Projectile prefab", projectilesPrefab, Object, true);
					soundOfProjectiles = EditorGUILayout.ObjectField(GUIContent("- Sound on touch","Sound that will be instantiate when collision with object."), soundOfProjectiles, Object, true);
					numberOfProjectiles = EditorGUILayout.IntField(GUIContent("- Number of projectiles","Number of projectiles spawned at current time in lava environment."), numberOfProjectiles);				
					EditorGUILayout.LabelField("- Lavashot behavior");	
					EditorGUI.indentLevel++;
					projectilesTime = EditorGUILayout.Vector2Field("Launch interval: ", projectilesTime);
					projectilesForce  = EditorGUILayout.Vector2Field("Force: ", projectilesForce);
					projectilesDmg  = EditorGUILayout.FloatField("Damage: ", projectilesDmg);
                    EditorGUI.indentLevel--;
                    EditorGUI.indentLevel--;
				}
				EditorGUILayout.BeginHorizontal();
					assignSparkles_foldout = EditorGUILayout.Foldout(assignSparkles_foldout, "Lava sparkles");
					assignSparkles = GUILayout.Button("Assign");
					if (assignSparkles && !assignSparklesHigh)
						assignSparklesHigh = true;
				EditorGUILayout.EndHorizontal();
				if (assignSparkles_foldout)
				{
					EditorGUI.indentLevel++;
					sparklePrefab = EditorGUILayout.ObjectField("- Sparkles prefab", sparklePrefab, Object, true);
					numberOfSparkles = EditorGUILayout.IntField(GUIContent("- Number of sparkles","Number of sparkle particles spawned at current time in lava environment."), numberOfSparkles);
					EditorGUI.indentLevel--;
				}
			EditorGUI.indentLevel--;	
		}
		EditorGUILayout.LabelField("Tools", EditorStyles.boldLabel);
		EditorGUI.indentLevel++;
		EditorGUILayout.BeginHorizontal();
        addFireUI_foldout = EditorGUILayout.Foldout(addFireUI_foldout, "FireUI tool");
        addFireUI = GUILayout.Button("Add FireUI", GUILayout.MaxWidth(245));
        if (addFireUI && !addFireUIHigh)
            addFireUIHigh = true;
        EditorGUILayout.EndHorizontal();
        if (addFireUI_foldout)
        {
            EditorGUILayout.LabelField("This tool will add UI fire feature to scene.", EditorStyles.helpBox);
        }		
		EditorGUILayout.BeginHorizontal();			
			assignLayers_foldout = EditorGUILayout.Foldout(assignLayers_foldout, "Layers tool");
			assignLayers = GUILayout.Button("Configure scene", GUILayout.MaxWidth(245));
			if (assignLayers && !assignLayersHigh)
				assignLayersHigh = true;
		EditorGUILayout.EndHorizontal();
		if (assignLayers_foldout)
		{
			if(assignLayers_foldout) {
			 	EditorGUILayout.LabelField("This tool allows you to automatically prepare your project and necessary layers so Hell Lava will work properly.", EditorStyles.helpBox);
                EditorGUILayout.HelpBox("Generating lava surface or adding some features will also affect in adding this layers configuration to your project if not already existing.", MessageType.Info, true);

			    EditorGUILayout.LabelField(" - Layers to create:");
				EditorGUI.indentLevel++;	
			    var x : int = 0;
				GUI.SetNextControlName("SizeLayerConfSize");
			    layerConfSize = EditorGUILayout.IntField("Size", layerConfSize);
			    if(enter && assignLayersArr.Length != layerConfSize) {
			        var newArray : String[] = new String[layerConfSize];
			        for(x = 0; x < layerConfSize; x++) 
			            if(assignLayersArr.Length > x)
			            	newArray[x] = assignLayersArr[x];
			        assignLayersArr = newArray;
			    }
			    for(x = 0; x < assignLayersArr.Length; x++) {
			        assignLayersArr[x] = EditorGUILayout.TextField("Layer "+x, assignLayersArr[x]);
			    }
			    EditorGUI.indentLevel--;	
			    EditorGUILayout.LabelField("");
			    EditorGUILayout.LabelField(" - Layers collision deselect:");
			    EditorGUI.indentLevel++;	
			    var x2 : int = 0;
				GUI.SetNextControlName("SizelayerCollidConfSize");
			    layerCollidConfSize  = EditorGUILayout.IntField("Size", layerCollidConfSize );
			    if(enter && assignLayersConfArr.Length != layerCollidConfSize*2 ) {
			        var newArray2 : int[] = new int[layerCollidConfSize*2];
			        for(x2 = 0; x2 < layerCollidConfSize*2 ; x2++) {
			            if(assignLayersConfArr.Length > x2) {
			                newArray2[x2] = assignLayersConfArr [x2];
			            }
			        }

			        assignLayersConfArr  = newArray2;
			    }
			    var firtIndex = ["Select All"];
			    var layerArray = GetLayerArray(assignLayersArr);
			    finalLayerArrayWithoutAll = new String[0];
			    finalLayerArray = new String[0];
			    finalLayerArrayWithoutAll = finalLayerArrayWithoutAll.Concat(layerArray).ToArray();
			    finalLayerArrayWithoutAll = finalLayerArrayWithoutAll.Concat(assignLayersArr).ToArray();
			    finalLayerArray =  finalLayerArray.Concat(firtIndex).ToArray();
			    finalLayerArray =  finalLayerArray.Concat(finalLayerArrayWithoutAll).ToArray();
			    for(x2 = 0; x2 < assignLayersConfArr.Length; x2+=2) 
			    {
			    	EditorGUILayout.BeginHorizontal();	
			     	assignLayersConfArr[x2] = EditorGUILayout.Popup(assignLayersConfArr[x2],finalLayerArray);
			     	EditorGUILayout.LabelField("<->",GUILayout.MaxWidth(60));
			     	assignLayersConfArr[x2+1] = EditorGUILayout.Popup(assignLayersConfArr[x2+1], finalLayerArray);
			     	EditorGUILayout.EndHorizontal();	
			    }
			    EditorGUI.indentLevel--;		     
			    EditorGUILayout.LabelField("");
			    EditorGUILayout.LabelField(" - Object layer assign:");
			    EditorGUI.indentLevel++;	
			    var x3 : int = 0;
				GUI.SetNextControlName("SizePrefabConfSize");
			    layerPrefabConfSize  = EditorGUILayout.IntField("Size", layerPrefabConfSize );
			    if(enter && layerPrefabArray.Length != layerPrefabConfSize ) {
			        var newArray3 : LayerToolClass[] = new LayerToolClass[layerPrefabConfSize];
			        for(x3 = 0; x3 < layerPrefabConfSize ; x3++) 
			        {
			            if(layerPrefabArray.Length > x3) 
			                newArray3[x3] = layerPrefabArray [x3];                 

			            if (newArray3[x3]==null)
			               	newArray3[x3] = new LayerToolClass();
			        }
			        layerPrefabArray  = newArray3;
			    } 
			    for(x3 = 0; x3 < layerPrefabArray.Length; x3++) {
			    	EditorGUILayout.BeginHorizontal();
					EditorGUILayout.LabelField("Object " + x3,GUILayout.MaxWidth(90));
			        layerPrefabArray[x3].gameObject = EditorGUILayout.ObjectField("", layerPrefabArray[x3].gameObject, GameObject, true, GUILayout.MaxWidth(170));
			     	EditorGUILayout.LabelField("<--",GUILayout.MaxWidth(45));
			     	layerPrefabArray[x3].index = EditorGUILayout.Popup(layerPrefabArray[x3].index, finalLayerArrayWithoutAll);
			     	EditorGUILayout.EndHorizontal();
			    }
			    EditorGUILayout.LabelField("");
			    EditorGUI.indentLevel--;	
 			}
		}
		//EditorGUILayout.BeginHorizontal();
        assignIgnoredObjects_foldout = EditorGUILayout.Foldout(assignIgnoredObjects_foldout, "Ignored objects");
        //assignIgnoredObjects = GUILayout.Button("Mark ignored objects", GUILayout.MaxWidth(245));
        //if (assignIgnoredObjects && !assignIgnoredObjectsHigh)
        //    assignIgnoredObjectsHigh = true;
        //EditorGUILayout.EndHorizontal();
        if (assignIgnoredObjects_foldout)
        {
            if (ignoreObjectsSize == -1 || ignorePrefabsSize == -1)
            {              
                var ignoredSceneList : List.<GameObject> = new List.<GameObject>();
                var ignoredPrefabList : List.<GameObject> = new List.<GameObject>();
                allIgnoredObjects = Resources.FindObjectsOfTypeAll.<IgnoredObject>();
                for (var ignoredObject : IgnoredObject in allIgnoredObjects)
                {
                    if (EditorUtility.IsPersistent(ignoredObject.gameObject))
                        ignoredPrefabList.Add(ignoredObject.gameObject);
                    else
                        ignoredSceneList.Add(ignoredObject.gameObject);
                }
                ignoreObjectArr = ignoredSceneList.ToArray();
                ignorePrefabsArr = ignoredPrefabList.ToArray();

                ignoreObjectsSize = ignoreObjectArr.Length;
                ignorePrefabsSize = ignorePrefabsArr.Length ;
            }
			EditorGUILayout.LabelField("This tool allows you to mark specific object to be ignored by Hell Lava interaction engine. Just add or remove object from list below, and it will be updated immiedatly!", EditorStyles.helpBox);
            EditorGUILayout.LabelField(" - Prefabs:");
            EditorGUI.indentLevel++;
			var newArrayObj : GameObject[];
            var x1 = 0;

            GUI.SetNextControlName("SizeIgnorePrefabs");
            ignorePrefabsSize = EditorGUILayout.IntField("Size", ignorePrefabsSize);
            if (enter && ignorePrefabsArr.Length != ignorePrefabsSize)
            {
                newArrayObj = new GameObject[ignorePrefabsSize];
                for (x1 = ignorePrefabsSize; x1< ignorePrefabsArr.Length; x1++)
                {
                    
                    if (ignorePrefabsArr[x1] != null && ignorePrefabsArr[x1].GetComponent.<IgnoredObject>() != null)
                    {
                        for (var gameObject : GameObject in ignoreObjectArr)
                            if (PrefabUtility.GetPrefabParent(gameObject) as GameObject == ignorePrefabsArr[x1] && gameObject.GetComponent.<IgnoredObject>() != null)
                                DestroyImmediate(gameObject.GetComponent.<IgnoredObject>(), true);

                        DestroyImmediate(ignorePrefabsArr[x1].GetComponent.<IgnoredObject>(), true);
                        ignoreObjectsSize = -1;                      
                    }
                }
               
                for (x1 = 0; x1 < ignorePrefabsSize; x1++)
                    if (ignorePrefabsArr.Length > x1)
                        newArrayObj[x1] = ignorePrefabsArr[x1];
                ignorePrefabsArr = newArrayObj;                
            }

            for (x1 = 0; x1 < ignorePrefabsArr.Length; x1++)
            {
                EditorGUILayout.BeginHorizontal();
                ignorePrefabsArr[x1] = EditorGUILayout.ObjectField("Layer " + x1, ignorePrefabsArr[x1], typeof(GameObject), false) as GameObject;
                if (ignorePrefabsArr[x1] != null && ignorePrefabsArr[x1].GetComponent.<IgnoredObject>() == null)
                {
                    ignorePrefabsArr[x1].AddComponent.<IgnoredObject>();
                    ignoreObjectsSize = -1;
                }
                if (GUILayout.Button("-", EditorStyles.toolbarButton, GUILayout.MaxWidth(40)))
                {
                    if (ignorePrefabsArr[x1] != null && ignorePrefabsArr[x1].GetComponent.<IgnoredObject>() != null)
                    {
                        for (var gameObject : GameObject in ignoreObjectArr)
                            if (PrefabUtility.GetPrefabParent(gameObject) as GameObject == ignorePrefabsArr[x1] && gameObject.GetComponent.<IgnoredObject>() != null)
                                DestroyImmediate(gameObject.GetComponent.<IgnoredObject>(), true);
                        DestroyImmediate(ignorePrefabsArr[x1].GetComponent.<IgnoredObject>(), true);
                        ignoreObjectsSize = -1;
                    }
                    var ignorePrefabsList : List.<GameObject> = ignorePrefabsArr.ToList();
                    ignorePrefabsList.RemoveAt(x1);
                    ignorePrefabsArr = ignorePrefabsList.ToArray();
                    ignorePrefabsSize--;
                }
                EditorGUILayout.EndHorizontal();
            }
            
            EditorGUI.indentLevel--;
            EditorGUILayout.LabelField("");

            GUILayout.BeginHorizontal();
            EditorGUILayout.LabelField(" - Objects on scene:");
            EditorGUILayout.LabelField(SceneManager.GetActiveScene().name, EditorStyles.textField);
            GUILayout.EndHorizontal();
            EditorGUI.indentLevel++;

            GUI.SetNextControlName("SizeIgnoreObject");
            if (ignoreObjectsSize != -1)
            {

                ignoreObjectsSize = EditorGUILayout.IntField("Size", ignoreObjectsSize);


                if (enter && ignoreObjectArr.Length != ignoreObjectsSize)
                {
                    newArrayObj = new GameObject[ignoreObjectsSize];
                    for (x2 = ignoreObjectsSize; x2 < ignoreObjectArr.Length; x2++)
                        if (ignoreObjectArr[x2] != null && ignoreObjectArr[x2].GetComponent.<IgnoredObject>() != null)
                            DestroyImmediate(ignoreObjectArr[x2].GetComponent.<IgnoredObject>(), true);
                        
                    for (x2 = 0; x2 < ignoreObjectsSize; x2++)
                        if (ignoreObjectArr.Length > x2)
                            newArrayObj[x2] = ignoreObjectArr[x2];
                    ignoreObjectArr = newArrayObj;
                }

                for (x2 = 0; x2 < ignoreObjectArr.Length; x2++)
                {
                    GUILayout.BeginHorizontal();
                    ignoreObjectArr[x2] = EditorGUILayout.ObjectField("Layer " + x2, ignoreObjectArr[x2], typeof(GameObject), true) as GameObject;                                        
                    if (ignoreObjectArr[x2] != null && EditorUtility.IsPersistent(ignoreObjectArr[x2]))
                        ignoreObjectArr[x2] = null;

                    if (ignoreObjectArr[x2] != null && ignoreObjectArr[x2].GetComponent.<IgnoredObject>() == null)
                        ignoreObjectArr[x2].AddComponent.<IgnoredObject>();
                    if (GUILayout.Button("-", EditorStyles.toolbarButton, GUILayout.MaxWidth(40)))
                    {
                        if (ignoreObjectArr[x2] != null && ignoreObjectArr[x2].GetComponent.<IgnoredObject>() != null)
                            DestroyImmediate(ignoreObjectArr[x2].GetComponent.<IgnoredObject>(), true);
                        
                        var ignoreObjectList : List.<GameObject> = ignoreObjectArr.ToList();
                        ignoreObjectList.RemoveAt(x2);
                        ignoreObjectArr = ignoreObjectList.ToArray();
                        ignoreObjectsSize--;
                    }
                    GUILayout.EndHorizontal();
                }
            }
            EditorGUI.indentLevel--;
        }
		EditorGUILayout.EndScrollView();
		enter = false;
	}
	function OnInspectorUpdate() 
	{
		//check if some of the buttons was not clicked
		if (addFireUIHigh)
        {
            addFireUIHigh = false;
            AddFireUI();
        }
		if (assignLayersHigh)
		{
			assignLayersHigh=false;			
			AssignLayers();
		}
		if (generateHigh)
		{
			generateHigh=false;			
			GenerateLava();
		}
		if (saveHigh)
        {
            saveHigh = false;
            SaveGlobals();
        }
		if (newLavaHigh)
        {
            newLavaHigh = false;
            CreateNewLava();
        }
		if (assignTriggerHigh)
		{
			assignTriggerHigh=false;
			AssignTrigger();
		}
		if (assignColliderHigh)
		{
			assignColliderHigh=false;
			AssignCollider();
		}
		if (assignLightHigh)
		{
			assignLightHigh=false;
			AssignLight();
		}
		if (assignProjectilesHigh)
		{
			assignProjectilesHigh=false;
			AssignProjectiles();
		}
		if (assignSparklesHigh)
		{
			assignSparklesHigh=false;
			AssignSparkles();
		}
		if (autoDist && !autoDistLast)
		{
			tempDist = dist;
			dist=0;
			autoDistLast = autoDist;
		}
		else if (!autoDist && autoDistLast)
		{
			dist = tempDist;
			autoDistLast = autoDist;
		}
		/////////////////////////
		
		this.Repaint();
	}
	
}
// function that will save global settings.
function SaveGlobals()
{
	if (globalData == null)
		globalData = ScriptableObject.CreateInstance.<GlobalData>();

	globalData.healthScriptMono = healthScriptMono;
	globalData.healthScriptFieldName = healthScriptFieldName;
	globalData.recognitionIndex = recognitionIndex;
	globalData.recognitionString = recognitionString;

	globalData.CreateAsset("Assets/Hell Lava/Resources/", "GlobalData");
}
// create new lava object.
function CreateNewLava()
{
    var parentLava : GameObject = new GameObject("Hell Lava");
    parentObject = parentLava;
}
//function that will generate whole lava surface
private function GenerateLava()
{
	errorMessage = "";
	infoMessage = "";
	// variable declaration
	var colliderObject : Transform;
	var triggerObject : Transform; 
	var triggerObjectBox: Transform; 
		
	var thisMesh : Mesh;
	var name = parentObject.transform.name;
	
	var newVerts : Vector4[];
	var newTri = List.<int>();
	var newNormals : Vector3[];
	var newUvs : Vector2[];
	var newTangents: Vector4[];
	var newColor : Color[]; 
	
	var mf: MeshFilter;
	
	var startTime : float = Time.realtimeSinceStartup;
	var stopTime : float;
	//validate necessary data
	if (terrain == null)
	{
		errorMessage = "Terrain field cannot be none!";
		return;
	}
	if (width<=0)
	{
		errorMessage = "Width cannot be less or equal zero!";
		return;
	}
	if (height<=0)
	{
		errorMessage = "Height cannot be less or equal zero!";
		return;
	}
	if (antialiasingLevel<0)
	{
		errorMessage = "You cannot generate mesh if antialiasingLevel value is less from 0.";
		return;
	}
	if (steepness<=0)
	{
		Debug.LogError(this + ": You cannot generate mesh if steepness value is equal or less from 0");
		return;
	}
	if (autoDist)
    {
        while ((width / dist + 1) * (height / dist + 1) > 65000)
            dist += 0.001f;
        infoMessage = "Calculated distance: " + dist;
    }
	if (dist < 1)
    {
        errorMessage = "Distance between vertices cannot be less than 1.";
        return;
    }
	var changed : boolean;
	if (lavaElevation==0)
	{
		lavaElevation=0.01;
		changed= true;
	}
	var verX : int = width/dist +1;
	var verY : int = height/dist +1;
	
	if (verX * verY > ushort.MaxValue && !EditorUtility.DisplayDialog("Warning!", "It appears that your mesh may have more vertices (max " + verX * verY + ") than allowed " + ushort.MaxValue + ", however some of them may find himself under the terrain and will be removed, so the final count will be lower. If operation fails, you can always try again with greater dist value. Continue?", "Yes", "No"))            
        return;
	
	if (roundStep<=0 || roundStep>90)
	{
		Debug.LogError(this + ": You cannot generate mesh if roundStep value is not in interval (0, 90>");
		return;
	}
	var triNumber = (verX-1)*(verY-1)*2;  //number of mesh triangles
	newVerts= new Vector4[verX*verY];
	newNormals= new Vector3[verX*verY];
	newUvs= new Vector2[verX*verY];
	newTangents = new Vector4[verX*verY];
	newColor = new Color[verX*verY];
	//reset trigger and collider if exist
	
	triggerObject = parentObject.transform.Find("Interaction engine");
	
	if (triggerObject!=null && triggerObject.GetComponent.<MeshCollider>()!=null)
	{
		triggerObject.GetComponent.<MeshCollider>().sharedMesh = null;
		triggerObjectBox = triggerObject.transform.Find("Trigger");
	}
	else
		triggerObject==null;
	
	if (triggerObjectBox!=null && triggerObjectBox.GetComponent.<BoxCollider>()!=null)
		triggerObjectBox.GetComponent.<BoxCollider>().enabled = false;
	else
		triggerObjectBox==null;	
	
	colliderObject = parentObject.transform.Find("Sink blockade");
	if (colliderObject!=null && colliderObject.GetComponent.<MeshCollider>()!=null)
		colliderObject.GetComponent.<MeshCollider>().sharedMesh = null;
	else
		colliderObject==null;
	//initialize new mesh
	mf = parentObject.GetComponent.<MeshFilter>();
	if (mf==null)
		mf = parentObject.AddComponent.<MeshFilter>();
	var mr : MeshRenderer = parentObject.GetComponent.<MeshRenderer>();
	if (mr == null)
		mr = parentObject.AddComponent.<MeshRenderer>();
   	mr.shadowCastingMode=0;
   	mr.receiveShadows = false;
	// assign vertex, Normals, UVs, and tangents
	var vertPosition : Vector3;
	var vertPositionTranformed : Vector3;
	var hit : RaycastHit;
	//run through all of the vertices
	for(var y=0; y<verY;y++)
	{	
		if (EditorUtility.DisplayCancelableProgressBar("Generating lava surface", "Step 1: Calculating new mesh... " + (y*verX) + "/" + verY*verX, (y*verX+0.0)/(verY*verX)))
		{
			if (triggerObject!=null)
				triggerObject.GetComponent.<MeshCollider>().sharedMesh =  Resources.Load("Meshes/"+parentObject.name+"_mesh", Mesh);
			if (triggerObjectBox!=null)
				triggerObjectBox.GetComponent.<BoxCollider>().enabled=true;
			if (colliderObject!=null)
				colliderObject.GetComponent.<MeshCollider>().sharedMesh = Resources.Load("Meshes/"+parentObject.name+"_mesh", Mesh);
			EditorUtility.ClearProgressBar();
			return;
		}
		for(var x=0; x<verX;x++)
		{
			// first, we will check if vertex is close to terrain.
			vertPosition = Vector3(dist*x, 0, dist*y);
			vertPositionTranformed = parentObject.transform.TransformPoint(vertPosition);
			var closestPoint = new Vector3[Mathf.CeilToInt(360/roundStep)+1];
			var closestPointIndex : int;
			var vertPositionModedTranformed : Vector3 = Vector3(vertPositionTranformed.x, vertPositionTranformed.y+lavaElevation, vertPositionTranformed.z); //we need to add lavaElevation to vertex position, to chceck where is terrain shore
			var direction = Vector3.forward;
			//we will cast ray around examined vertex, every 'roundStep' deg. 
			var a : float = dist / 2; 
			for (var angle=0.0; angle<=360; angle+=roundStep)
			{
				//compute distance between square center point and square edge                                      
                var distToEdge : float = Mathf.Max(a * Mathf.Abs(1/Mathf.Cos(Mathf.Deg2Rad * angle)), a * Mathf.Abs(1 / Mathf.Sin(Mathf.Deg2Rad * angle)));
 				//calculate direction
 				direction = Quaternion.AngleAxis(roundStep, Vector3.up) * direction;
 				//cast ray. If collider is found, add point to generic list - later we will choose closest collider point
				if (Physics.Raycast(vertPositionModedTranformed, direction, hit, distToEdge))
				{
					closestPoint[closestPointIndex] = hit.point;
					closestPointIndex++;
				}	
			}		
			var smallestDistance = Mathf.Sqrt(2) * dist;
			var index=-1;
				
			//now we will chose the closest point on terrain shore (if one exist)
			for (var j=0; j<closestPointIndex; j++)
			{
				var temp = Vector3.Distance(vertPositionModedTranformed, closestPoint[j]);
				if (temp < smallestDistance)
				{
					smallestDistance = temp;
					index = j;
				}
			}
			//if terrain was found, assign that closest terrain point
			var ver4 : Vector4;
			if (index != -1)	
			{
				ver4 = parentObject.transform.InverseTransformPoint(closestPoint[index]);
				ver4.w=1;
				newVerts[y*verX + x] = ver4;
				newColor[y*verX + x]=new Color(0,0,0,1);
			}
			//else if terrain was not found, and vertex is placed under the terrain, AND terrain at vertex 
			//position is higher than lavaElevation, "cut" that point,
			else if (parentObject.transform.TransformPoint(vertPosition).y<terrain.SampleHeight(vertPositionTranformed)+terrain.transform.position.y && terrain.SampleHeight(vertPositionTranformed)+terrain.transform.position.y >lavaElevation + parentObject.transform.position.y)
			{
				newVerts[y*verX + x] = vertPosition;
				newColor[y*verX + x] = new Color(0,0,0,0);
			} 	
			//else if terrain was not found and vertex is placed above the terrain, leave it as it is.
			else
			{
				ver4 = vertPosition;
				ver4.w=1;
				newVerts[y*verX + x] = ver4;
				newColor[y*verX + x] = new Color(0,0,0,1);
			}			
			// set normals and tangents - this values are fixed
			newNormals[y*verX + x] = Vector3.up;
			newTangents[y*verX + x] = Vector4(0, 1, 0,1);
			// calculate and set UVs
			newUvs[y*verX + x] =Vector2(newVerts[y*verX + x].x/(dist*(verX-1)), newVerts[y*verX + x].z/(dist*(verX-1)));
			
		}
	}
	// apply antialiasing (we will lower down vertices around erected vertex, so the elevation will look 
	// smoother
		
	var sign = Mathf.Sign(lavaElevation);
	var iterations = antialiasingLevel*2+1; //calculate number of iterations for rows and columns for incoming array
	for (var VertIndex : float=0; VertIndex<newVerts.Length&&antialiasingLevel>0;VertIndex++)
	{
		if (VertIndex%100==0)
			if(EditorUtility.DisplayCancelableProgressBar("Generating lava surface", "Step 2: Antialiasing vertices... " + VertIndex + "/" + newVerts.Length, VertIndex/newVerts.Length))
			{
				if (triggerObject!=null)
					triggerObject.GetComponent.<MeshCollider>().sharedMesh =  Resources.Load("Meshes/"+parentObject.name+"_mesh", Mesh);
				if (triggerObjectBox!=null)
					triggerObjectBox.GetComponent.<BoxCollider>().enabled=true;
				if (colliderObject!=null)
					colliderObject.GetComponent.<MeshCollider>().sharedMesh = Resources.Load("Meshes/"+parentObject.name+"_mesh", Mesh);
				EditorUtility.ClearProgressBar();
				return;
			}
		var vertHeight = newVerts[VertIndex].y; 
		if (!Mathf.Approximately(newVerts[VertIndex].w, 0) && sign*vertHeight>=sign*lavaElevation)
		{
			//we will operate on 2D array of lava mesh vertices
			var rowNumber = verY - 1 - Mathf.Floor(VertIndex/verX);//calculate row number for erected vertex in all-lava-mesh-vertices-2D-array 
			var center = Vector2(VertIndex-(verY - 1 - rowNumber)*verX, rowNumber); //Transform index value to Vector2
			for (y=iterations-1; y>=0; y--)
			{
				for (x=0; x<iterations; x++)
				{
					// now we will calculate virtual 2d array, that will be our space around examined vertex. We need to check every vertex if it do exist and how much we need to lower it
					var localMatrix : Vector2 = Vector2( (VertIndex - (verY - 1 - rowNumber)*verX)+(x-antialiasingLevel), -y + rowNumber + antialiasingLevel);
					//checking the bounds. If lower than zero or bigger than boundaries, vertex do not exist
					if ( localMatrix.x>=0 && localMatrix.x<verX && localMatrix.y>=0 && localMatrix.y<verY)
					{
						var matrixIndex = (verY-1-localMatrix.y)*(verX-0) + localMatrix.x; // transform X-Y position to index position, since the vertices are numerated
						//height to lower is determined by distance between center vertex and his examined neighbor.
						//RULE: if distance is bigger, Vertex's Y will be lower
						var distance = Vector2.Distance(localMatrix, center);  
						if (distance==0) // this mean we are examing center vertex, so go to next vertex
							continue;
						//calculating new height for vertex. 
						var level : float =  (distance+1); //distance to level. Distance 0 mean level 1, distance 1 mean level 2 and so go on...						
						var newHeight : float = (lavaElevation/level)/steepness;
						//if vertex is not cut and his height is lower than that we've calculated
						if (!Mathf.Approximately(newVerts[matrixIndex].w, 0) && sign*newVerts[matrixIndex].y<sign*newHeight)
						{
							//assign new height
							var v = newVerts[matrixIndex];
							v.y = newHeight;
							newVerts[matrixIndex] = v;
						}
					}
				}
			}
		}
	}
	EditorUtility.ClearProgressBar();
	//assign alpha value for surface features
	for (a=0; a<newColor.Length; a++)
	{
		var color = newColor[a];
		color.a= newVerts[a].y/lavaElevation;
		newColor[a] = color;
	}
	
	// assign triangles
	var verIndex=verX-1;
	for(var i : float=0; i<triNumber;i++)
	{	
		if (i%100==0)
			if (EditorUtility.DisplayCancelableProgressBar("Generating lava surface", "Step 3: Assigning triangles... " + i + "/" + triNumber, i/triNumber))
			{
				if (triggerObject!=null)
					triggerObject.GetComponent.<MeshCollider>().sharedMesh =  Resources.Load("Meshes/"+parentObject.name+"_mesh", Mesh);
				if (triggerObjectBox!=null)
					triggerObjectBox.GetComponent.<BoxCollider>().enabled=true;
				if (colliderObject!=null)
					colliderObject.GetComponent.<MeshCollider>().sharedMesh = Resources.Load("Meshes/"+parentObject.name+"_mesh", Mesh);
				EditorUtility.ClearProgressBar();
				return;
			}
		if (i%((verX-1)*2)==0)
			verIndex++;
		if(i%2==0)
		{
			if (Mathf.Approximately(newVerts[verIndex-verX].w,0) || Mathf.Approximately(newVerts[verIndex].w,0) || Mathf.Approximately(newVerts[verIndex+1].w,0))
				continue;

			newTri.Add(verIndex-verX); 
			newTri.Add(verIndex);       
			newTri.Add(verIndex+1);

		}
		else
		{	
			if (Mathf.Approximately(newVerts[verIndex-verX +1].w, 0) || Mathf.Approximately(newVerts[verIndex-verX].w, 0) || Mathf.Approximately(newVerts[verIndex+1].w, 0))
			{
				verIndex++;
				continue;
			}
			
			newTri.Add(verIndex-verX +1); 
			newTri.Add(verIndex-verX);	  
			newTri.Add(verIndex+1);     
			verIndex++;
		}
	}
	EditorUtility.ClearProgressBar();
	//assign computed parameters
	thisMesh = new Mesh();
	thisMesh.Clear();
	var newTriArr = newTri.ToArray();
	var newVertsList = newVerts.ToList();
	var newVertsClean = new List.<Vector3>();
	var newNormalsList = newNormals.ToList();
	var newUvsList = newUvs.ToList();
	var newTangentsList= newTangents.ToList();
	var newColorList = newColor.ToList();
	//convert vertices list from vector4 to vector3, since W parameter was only needed for calculations
	//and clean mesh
	var counter : int = 0;
	var verticesCounter : int = newVertsList.Count;
	for (var n : int =0; n<newVertsList.Count; n++)	
	{	
		if (counter%100==0)
			if (EditorUtility.DisplayCancelableProgressBar("Generating lava surface", "Step 4: Cleaning mesh... Removed vertices: " + (verticesCounter-newVertsList.Count), n/(newVertsList.Count+0.0)))
			{
				if (triggerObject!=null)
					triggerObject.GetComponent.<MeshCollider>().sharedMesh =  Resources.Load("Meshes/"+parentObject.name+"_mesh", Mesh);
				if (triggerObjectBox!=null)
					triggerObjectBox.GetComponent.<BoxCollider>().enabled=true;
				if (colliderObject!=null)
					colliderObject.GetComponent.<MeshCollider>().sharedMesh = Resources.Load("Meshes/"+parentObject.name+"_mesh", Mesh);
				EditorUtility.ClearProgressBar();
				return;
			}
		if (Mathf.Approximately(newVertsList[n].w,0))
		{
			newVertsList.RemoveAt(n);
			newNormalsList.RemoveAt(n);
			newUvsList.RemoveAt(n);
			newTangentsList.RemoveAt(n);
			newColorList.RemoveAt(n);
			for (var n2 = n; n2<newTriArr.Length; n2++)
				if (newTriArr[n2]>n)
					newTriArr[n2]-=1;
			n--;
		}
		else
			newVertsClean.Add(newVertsList[n]);
		
		counter++;
	}
	EditorUtility.ClearProgressBar();
	if (newVertsClean.Count>= ushort.MaxValue)
    {
        EditorUtility.DisplayDialog("Error!", "Final mesh have more vertices (" + newVertsClean.Count + ") than allowed " + ushort.MaxValue + ". Try reduce dist parameter.", "Ok");
        if (triggerObject != null)
            triggerObject.GetComponent.<MeshCollider>().sharedMesh = Resources.Load("Meshes/" + parentObject.name + "_mesh") as Mesh;
        if (triggerObjectBox != null)
            triggerObjectBox.GetComponent.<BoxCollider>().enabled = true;
        if (colliderObject != null)
            colliderObject.GetComponent.<MeshCollider>().sharedMesh = Resources.Load("Meshes/" + parentObject.name + "_mesh") as Mesh;
        return;
    }
	thisMesh.vertices = newVertsClean.ToArray();
	thisMesh.triangles = newTriArr;
	thisMesh.normals = newNormalsList.ToArray();
	thisMesh.uv = newUvsList.ToArray();
	thisMesh.tangents = newTangentsList.ToArray();
	thisMesh.colors = newColorList.ToArray();
	thisMesh.RecalculateNormals();
	thisMesh.RecalculateBounds();
	;
	
	mf.mesh = thisMesh;
	// assign material
	if (material!=null)
		parentObject.GetComponent(Renderer).sharedMaterial = material;
	else
		Debug.LogWarning(this + ": No material attached to creator. Mesh will be created without material.");
		
	//assign surface handler
	AssignScroll();
	
	loadSaves = false;
	if (triggerObject!=null)
		triggerObject.GetComponent.<MeshCollider>().sharedMesh = thisMesh;
	
	if (triggerObjectBox!=null)
	{
		var collidBox : BoxCollider = triggerObjectBox.GetComponent.<BoxCollider>();
		collidBox.enabled = true;
		collidBox.size = Vector3(width, lavaElevation, height);
		collidBox.center = Vector3(width, lavaElevation, height)/2;
   	}
	if (colliderObject!=null)
		colliderObject.GetComponent.<MeshCollider>().sharedMesh = thisMesh;
	
	
	//save everything
	var surfData : MeshData = ScriptableObject.CreateInstance.<MeshData>();

	surfData.Terrain(terrain);
	surfData.material = material;
	surfData.width = width;
	surfData.height = height;
	surfData.dist = dist;
			
	surfData.roundStep = roundStep;
	surfData.antialiasingLevel = antialiasingLevel;
	surfData.steepness = steepness;
	if (changed)
		lavaElevation=0;
	surfData.lavaElevation = lavaElevation;
	surfData.autoDist = autoDist;
	
	surfData.CreateAsset("Assets/Hell Lava/Resources/Meshes/", name);
	AssetDatabase.DeleteAsset("Assets/Hell Lava/Resources/Meshes/"+name+"_mesh.asset" ); 
	AssetDatabase.CreateAsset( thisMesh, "Assets/Hell Lava/Resources/Meshes/"+name+"_mesh.asset"); 
	AssetDatabase.SaveAssets();
	DestroyImmediate(surfData,false);
	stopTime =  Time.realtimeSinceStartup;
	//assign layers and their collisions
	AssignLayers();
	//assign FireUI feature
    AddFireUI();
	Debug.Log(this + ": Done in " + (stopTime-startTime) +"s!");
}
function AssignLight() //assign light
{
	//validating
	if (terrain == null)
	{
		Debug.LogError(this + ": Terrain field cannot be none!");
		return;
	}
	if (lightPrefab==null)
	{
		Debug.LogError(this + ": Light prefab cannot be none!");
		return;
	}	
	if (SpaceBetweenLights<=0)
	{
		Debug.LogError("Distance between lights cannot be less or equal 0!");
		return;
	}
	
	var mr : MeshRenderer = parentObject.GetComponent(MeshRenderer);
	if (mr == null)
	{
		Debug.LogError(this + ": Parent object have no lava mesh renderer! Feature won't be instantiate!");
		return;
	}
	var LightChildren : GameObject= new GameObject();
	
	//we need to delete old light, if exist
	var tempTransform : Transform = parentObject.transform.Find("lighting");
    	if (tempTransform!=null)
    		DestroyImmediate(tempTransform.gameObject);
    		
	//creating new lights parent	
	LightChildren.name = "lighting";
	LightChildren.transform.parent = parentObject.transform;
	LightChildren.transform.position = parentObject.transform.position;
	
	//creating lights
	for (var z=parentObject.transform.position.z; z<=mr.bounds.size.z+parentObject.transform.position.z; z+=SpaceBetweenLights)
	{
		for (var x=parentObject.transform.position.x; x<=mr.bounds.size.x+parentObject.transform.position.x; x+=SpaceBetweenLights)
		{
			if (terrain.SampleHeight(Vector3(x,parentObject.transform.position.y,z))+terrain.transform.position.y <=lavaElevation + parentObject.transform.position.y)
			{
				var tempLight : GameObject =  PrefabUtility.InstantiatePrefab(lightPrefab) as GameObject;
                tempLight.transform.position = new Vector3(x, parentObject.transform.position.y, z);
				tempLight.transform.parent = LightChildren.transform;
			}
		}
	}
	Debug.Log(this + ": Lava lighting has been assigned!");
}
function AssignProjectiles() //assign lava projectiles
{
	//assign lava projectile script
	if (parentObject.GetComponent.<Renderer>()==null)
	{
		Debug.LogError(this + ": There is no lava surface added to parent game object. Projectile feature won't be added.");
		return;
	}
	var script : ProjectilesSpawner;
	script = parentObject.gameObject.GetComponent.<ProjectilesSpawner>();
    var projectileScript: LavaShot = projectilesPrefab.gameObject.GetComponent.<LavaShot>();
	if (script==null)
		script = parentObject.gameObject.AddComponent.<ProjectilesSpawner>();
	
	if (terrain==null)
		Debug.LogWarning(this + ": There is no terrain attached to creator. This feature has been assigned to parent object, but won't work after game launch.");
	if (projectilesPrefab==null)
		Debug.LogWarning(this + ": There is no projectile prefab attached to creator. This feature has been assigned to parent object, but won't work after game launch.");

	AssignLayers();	

	script.terrain = terrain; 
	script.numberOfProjectiles = numberOfProjectiles;
	script.projectile = projectilesPrefab;
	
	if (projectileScript!=null)
	{
		projectileScript.soundEnter = soundOfProjectiles;
		projectileScript.minTime = projectilesTime.x;
		projectileScript.maxTime = projectilesTime.y;
		projectileScript.minForce = projectilesForce.x;
		projectileScript.maxForce = projectilesForce.y;
		projectileScript.damage = projectilesDmg;
	}
	Debug.Log(this + ": Lava projectiles feature has been assigned!");
}
function AssignSparkles() //assign lava projectiles
{
	//assign lava sparkle spawner script
	var script : SparkleSpawner;
	script = parentObject.gameObject.GetComponent.<SparkleSpawner>();
	if (script==null)
		script = parentObject.gameObject.AddComponent.<SparkleSpawner>();
	if (terrain==null)
		Debug.LogWarning(this + ": There is no terrain attached to creator. This feature has been assigned to parent object, but won't work after game launch.");
	if (sparklePrefab==null)
		Debug.LogWarning(this + ": There is no sparkle prefab attached to creator. This feature has been assigned to parent object, but won't work after game launch.");
	
	script.terrain = terrain; 
	script.numberOfSparkles = numberOfSparkles;
	script.sparkle = sparklePrefab;
	Debug.Log(this + ": Lava sparkles feature has been assigned!");
}
function AssignScroll()
{
	//assign lava smoke script
	if (parentObject.GetComponent.<Renderer>()==null)
	{
		Debug.LogError(this + ": There is no lava surface added to parent game object. Scrolling feature won't be added.");
		return;
	}
	var script : SurfaceHandler = parentObject.gameObject.GetComponent.<SurfaceHandler>();
	if (script==null)
		script = parentObject.gameObject.AddComponent.<SurfaceHandler>();
	
	script.speedMainTex = speedMainTex; 
	script.speedShoreTex = speedShoreTex;
	script.angleDirection = angleDirection;
	script.lavaWavesDuration = lavaWavesDuration;
	script.lavaWavesAmplitude = lavaWavesAmplitude;
}
function AssignTrigger()
{
	var triggerSurfaceMesh : Mesh = Resources.Load("Meshes/"+parentObject.name+"_mesh", Mesh);
	// check if surface data and surface mesh exists.
	if (triggerSurfaceMesh==null)
	{
		Debug.LogError(this + ": Surface was not generated.");  
		return;
	}
	// add interaction engine main gameObject
	var TriggerRoot : GameObject;
	var TriggerRootTransform : Transform = parentObject.transform.Find("Interaction engine");
	if (TriggerRootTransform==null)
	{
		TriggerRoot = new GameObject();
		TriggerRoot.name = "Interaction engine";
		TriggerRootTransform = TriggerRoot.transform;
	}
	else 
		TriggerRoot = TriggerRootTransform.gameObject;
	
	TriggerRootTransform.parent = parentObject.transform;
	TriggerRootTransform.localPosition = Vector3.zero; 
	
	//add mesh collider to main gameObject
	var collid : MeshCollider = TriggerRoot.GetComponent.<MeshCollider>();
	if (collid==null)
		collid = TriggerRoot.gameObject.AddComponent.<MeshCollider>();
	collid.sharedMesh = triggerSurfaceMesh;
	//add trigger child to interaction engine main gameObject
	var TriggerBoxTransform : Transform = TriggerRootTransform.Find("Trigger");
	var TriggerBox : GameObject;
	if (TriggerBoxTransform==null)
	{
		TriggerBox = new GameObject();
		TriggerBox.name = "Trigger";
		TriggerBoxTransform = TriggerBox.transform;
	}
	else 
		TriggerBox = TriggerBoxTransform.gameObject;
	TriggerBoxTransform.parent = TriggerRoot.transform; 
	TriggerBoxTransform.localPosition = Vector3.zero;
	
	// add box collider to interaction engine trigger child
	var collidBox : BoxCollider = TriggerBox.GetComponent.<BoxCollider>();
	if (collidBox==null)
		collidBox = TriggerBox.gameObject.AddComponent.<BoxCollider>();
	
	collidBox.isTrigger = true;
	collidBox.size = Vector3(width, lavaElevation, height);
	collidBox.center = Vector3(width, lavaElevation, height)/2;
	// add trigger script to interaction engine main gameObject
	var triggerScript : LavaTrigger;
	triggerScript = TriggerRoot.GetComponent.<LavaTrigger>();
	if (triggerScript==null)
		triggerScript = TriggerRoot.AddComponent.<LavaTrigger>();
	
	triggerScript.steamSound =steamSoundEnter;
	triggerScript.steamSoundLooped =steamSoundStay;
	triggerScript.steamSoundExit =steamSoundExit;
	triggerScript.LavaSplash =lavaSplash;
	triggerScript.burningDamage = burningDamage;
	triggerScript.lavaDrag = lavaDrag;           
	triggerScript.lavaAngularDrag = lavaAngularDrag;    
	triggerScript.lockTextures = lockTextures;     
	triggerScript.steamIfDeath = steamIfDeath;     
	triggerScript.splashIfDeath = splashIfDeath;
	if (steamSoundEnter==null)
		Debug.LogWarning(this + ": There is no enter steam sound prefab attached to creator. Lava trigger has been assigned to parent object, but won't work after game launch.");
	if (steamSoundStay==null)
		Debug.LogWarning(this + ": There is no stay steam sound prefab attached to creator. Lava trigger has been assigned to parent object, but won't work after game launch.");
	if (steamSoundExit==null)
		Debug.LogWarning(this + ": There is no exit steam sound prefab attached to creator. Lava trigger has been assigned to parent object, but won't work after game launch.");
	if (lavaSplash==null)
		Debug.LogWarning(this + ": There is no lava splash prefab attached to creator. Lava trigger has been assigned to parent object, but won't work after game launch.");
	
	// add rigidbody to interaction engine main gameObject
	var rigidbody : Rigidbody;
	rigidbody = TriggerRoot.GetComponent.<Rigidbody>();
	if (rigidbody==null)
		rigidbody = TriggerRoot.AddComponent.<Rigidbody>();
	
	rigidbody.isKinematic = true;
	rigidbody.useGravity = false;
	
	AssignLayers();

	Debug.Log(this + ": Lava interaction engine has been assigned!");
}
function AssignCollider() //function that will assign lava blockade
{
	var childrenTransform : Transform;
	var children : GameObject;
	var mesh : Mesh = Resources.Load("Meshes/"+parentObject.name + "_mesh", Mesh);
	if (mesh==null)
	{
		Debug.LogError(this + ": Lava has been not generated for this parent object! Generate it first!");
		return;
	}
	childrenTransform = parentObject.transform.Find("Sink blockade");
	// if children not found, we have to create one
	if (childrenTransform==null)
	{
		children = new GameObject();
		children.name = "Sink blockade";
		children.transform.parent = parentObject.transform;
		children.transform.localPosition = Vector3.zero; 
	}
	else
		children = childrenTransform.gameObject;
	children.transform.localPosition.y = collideInitY;
	// also we need to check, if our children have mesh collider
	var collid = children.GetComponent(MeshCollider);
	if (collid==null)
	{
		collid = children.gameObject.AddComponent.<MeshCollider>();
		collid.isTrigger = false;
	}
	// assign new mesh as collider
	collid.sharedMesh = mesh;
	//asign layer
	AssignLayers();
		
	Debug.Log(this + ": Lava collider has been assigned!");
}
function AssignLayers()  //function that will assign necessary layers
{
	var lavaData : MeshData= ScriptableObject.CreateInstance.<MeshData>();
	if (parentObject!=null && !lavaData.LoadAsset("Meshes", parentObject.name))
	{
		Debug.LogError(this + ": There is no saved asset for this '"+parentObject.name+"'. Did you changed name of lava parent object or changed some path? Reupload hell lava package or generate new surface from GameObject>Create Other>Lava environment. Auto configuration aborted.");
		lavaData.isConfigured = false;
		return;
	}
	var i : int = 0;
	var firtIndex = ["Select All"];
	var layerArray = GetLayerArray(assignLayersArr); //get all existing layers array
	//add all arrays to create one whole final layer array
	finalLayerArrayWithoutAll = new String[0];
	finalLayerArray = new String[0];
	finalLayerArrayWithoutAll = finalLayerArrayWithoutAll.Concat(layerArray).ToArray();
	finalLayerArrayWithoutAll = finalLayerArrayWithoutAll.Concat(assignLayersArr).ToArray();
	finalLayerArray =  finalLayerArray.Concat(firtIndex).ToArray();
	finalLayerArray =  finalLayerArray.Concat(finalLayerArrayWithoutAll).ToArray();
	layerPrefabArray = InitObjectArray(finalLayerArrayWithoutAll);
	layerPrefabConfSize = layerPrefabArray.Length;
	for (i = 0; i<assignLayersArr.Length; i++)
	{
		//validation
		if (LayerMask.NameToLayer(assignLayersArr[i])==-1)
		{
			if (LayerMask.NameToLayer("")==-1)
			{
				Debug.LogWarning(this + ": There is not enough space in Tag Manager for all defined layers. Error occurred on '"+assignLayersArr[i]+"' layer. Make space for " +(assignLayersArr.Length-i) +" more layers and try again. Operation Aborted.");
				return;
			}
			else
				SetLayer(LayerMask.NameToLayer(""), assignLayersArr[i]);
		}
	}
	//assign layers
	for (i = 0; i<assignLayersConfArr.Length; i+=2) 
	{
		// "select all" to "select all" is not allowed
		if (assignLayersConfArr[i]==0 && assignLayersConfArr[i+1]==0)
			Debug.LogWarning(this + ":There was an attempt to uncheck layer collision in relation all to all. Due to secure policy, attempt was aborted.");
		//deselect collision between layers
		else if (assignLayersConfArr[i]==0)
		{
			for (var v1=0; v1<32; v1++)
				Physics.IgnoreLayerCollision(LayerMask.NameToLayer(finalLayerArray[assignLayersConfArr[i+1]]),v1,true);
		}
		else if (assignLayersConfArr[i+1]==0)
		{
			for (var v2=0; v2<32; v2++)
				Physics.IgnoreLayerCollision(LayerMask.NameToLayer(finalLayerArray[assignLayersConfArr[i]]),v2,true);
		}
		else
			Physics.IgnoreLayerCollision(LayerMask.NameToLayer(finalLayerArray[assignLayersConfArr[i]]),LayerMask.NameToLayer(finalLayerArray[assignLayersConfArr[i+1]]),true);
	}
	//assign layers to selected objects
	for (i = 0; i<layerPrefabArray.Length; i++)
	{
		if (layerPrefabArray[i].gameObject!=null)
			layerPrefabArray[i].gameObject.layer =LayerMask.NameToLayer(finalLayerArrayWithoutAll[layerPrefabArray[i].index]);
	}
	//save info to lava data
	if (parentObject!=null)
	{
		lavaData.isConfigured = true;
		lavaData.CreateAsset("Assets/Hell Lava/Resources/Meshes/", parentObject.name);
	}
	DestroyImmediate(lavaData, false);
	Debug.Log(this + ": Layers has been assigned!");
}
 function AddFireUI()
 {
	var fireUIHandler : FireUIHandler = FindObjectOfType.<FireUIHandler>();
    if (fireUIHandler == null)
    {
        var canvas : Canvas = FindObjectOfType.<Canvas>();
        if (canvas == null)
        {
            var canvasGameObjec : GameObject = new GameObject("Canvas", RectTransform, Canvas, CanvasScaler, GraphicRaycaster);
            canvas = canvasGameObjec.GetComponent.<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        }
        var fireUIHandlerGameObject : GameObject = new GameObject("FireUI", RectTransform, CanvasRenderer, Image, FireUIHandler);
        var fireUIHandlerRectTransform : RectTransform = fireUIHandlerGameObject.GetComponent.<RectTransform>();
        fireUIHandlerRectTransform.SetParent(canvas.transform);            
        fireUIHandlerRectTransform.anchorMin = Vector3.zero;
        fireUIHandlerRectTransform.anchorMax = Vector3.one;
        fireUIHandlerRectTransform.localScale = Vector3.one; 
        fireUIHandlerRectTransform.sizeDelta = Vector3.zero;
        fireUIHandlerRectTransform.anchoredPosition = Vector3.zero;
        var fireUIHandlerImage : Image = fireUIHandlerGameObject.GetComponent.<Image>();
        fireUIHandlerImage.sprite = Resources.Load.<Sprite>("Textures/flameTexture");
        fireUIHandlerImage.color = new Color(1, 1, 1, 0);
        fireUIHandlerImage.material = Resources.Load.<Material>("Materials/UIFlamesMaterial");
        Debug.Log(this + ": FireUI is already exising!");
    }
    else
        Debug.Log(this + ": FireUI feature has been added!");
 } 
private function InitObjectArray(givenArray : String[]) //this function will find all lava gameobjects that are coming from Hell Lava
{
	var i : int;
	var finalArray : LayerToolClass[] = new LayerToolClass[0];
	var lavas : SurfaceHandler[];
    var interactionEngines: LavaTrigger[];
    var lavaShots: LavaShot[];
    var lavaFalls: Lavafall[];
	var triggersList : List.<LayerToolClass> = new List.<LayerToolClass>();
	var sinkBlockadesList : List.<LayerToolClass> = new List.<LayerToolClass>();
	
	var lavasObject : LayerToolClass[];
	var lavaShotsObject : LayerToolClass[];
	var lavaFallsObject : LayerToolClass[];
	var interactionEnginesObject : LayerToolClass[];
	
	//find lavafalls
	lavaFalls = Resources.FindObjectsOfTypeAll.<Lavafall>();
	if (lavaFalls.Length>0)
	{
		lavaFallsObject = new LayerToolClass[lavaFalls.Length];
		for (i=0; i<lavaFallsObject.Length;i++)
		{
			lavaFallsObject[i] = new LayerToolClass(lavaFalls[i].gameObject);
			for (var l2 =0; l2<givenArray.Length; l2++)
				if (givenArray[l2].Equals(layers[2]))
				{
					lavaFallsObject[i].index = l2;
					break;
				}	
		}
	}
	
	//find lava shots
	lavaShots = Resources.FindObjectsOfTypeAll.<LavaShot>();
	if (lavaShots.Length>0)
	{
		lavaShotsObject = new LayerToolClass[lavaShots.Length];
		for (i=0; i<lavaShotsObject.Length;i++)
		{
			lavaShotsObject[i] = new LayerToolClass(lavaShots[i].gameObject);
			for (var l3 =0; l3<givenArray.Length; l3++)
				if (givenArray[l3].Equals(layers[3]))
				{
					lavaShotsObject[i].index = l3;
					break;
				}	
		}
	}
	//find main lava object
    lavas = Resources.FindObjectsOfTypeAll.<SurfaceHandler>();
    if (lavas.Length>0)
	{
        lavasObject = new LayerToolClass[lavas.Length];
        var meshName: String[] = new String[lavas.Length];
		for (i=0; i<lavasObject.Length;i++)
		{
            lavasObject[i] = new LayerToolClass(lavas[i].gameObject);
			
			// find sink blockades and triggers
			var meshFilter : MeshFilter = lavasObject[i].gameObject.GetComponent.<MeshFilter>();
			meshName[i] = null;
			if (meshFilter!=null)
				meshName[i] = meshFilter.sharedMesh.name.Split(" "[0])[0];
			
			var tempArray : MeshCollider[] = lavasObject[i].gameObject.GetComponentsInChildren.<MeshCollider>();
			for (var i1=0; i1<tempArray.Length; i1++)
			{
				if (tempArray[i1].sharedMesh.name.Equals(meshName[i]) && tempArray[i1].gameObject.GetComponent.<LavaTrigger>()==null)
				{
					sinkBlockadesList.Add(new LayerToolClass(tempArray[i1].gameObject));
					for (var l1=0; l1<givenArray.Length; l1++)
						if (givenArray[l1].Equals(layers[1]))
						{
							sinkBlockadesList[sinkBlockadesList.Count-1].index = l1;
							break;
						}	
				}
				else if (tempArray[i1].sharedMesh.name.Equals(meshName[i]) && tempArray[i1].gameObject.GetComponent.<LavaTrigger>()!=null)
				{
					var tempArrayTrigs = tempArray[i1].GetComponentsInChildren.<BoxCollider>();
					for (var i2=0; i2<tempArrayTrigs.Length; i2++)
						if (tempArrayTrigs[i2].isTrigger)
						{
							triggersList.Add(new LayerToolClass(tempArrayTrigs[i2].gameObject) );
							for (var l0 =0; l0<givenArray.Length; l0++)
								if (givenArray[l0].Equals(layers[0]))
								{
									triggersList[triggersList.Count-1].index = l0;
									break;
								}	
						}
				}
			}
		}
		//find interaction engine
		interactionEngines = Resources.FindObjectsOfTypeAll.<LavaTrigger>();
		if (interactionEngines.Length>0)
		{
			interactionEnginesObject = new LayerToolClass[interactionEngines.Length];
			for (i=0; i<interactionEnginesObject.Length;i++)
			{
				interactionEnginesObject[i] = new LayerToolClass(interactionEngines[i].gameObject);
				for (var l5 =0; l5<givenArray.Length; l5++)
					if (givenArray[l5].Equals(layers[5]))
					{
						interactionEnginesObject[i].index = l5;
						break;
					}	
			}
		}
	}
		
	///build final array		
	if (interactionEnginesObject!=null)
		finalArray =  finalArray.Concat(interactionEnginesObject).ToArray();
	finalArray =  finalArray.Concat(triggersList).ToArray();
	finalArray =  finalArray.Concat(sinkBlockadesList).ToArray();
	if (lavaShotsObject!=null)	
		finalArray = finalArray.Concat(lavaShotsObject).ToArray();
	if (lavaFallsObject!=null)
		finalArray = finalArray.Concat(lavaFallsObject).ToArray();
	layerPrefabConfSize = finalArray.Length;
	return finalArray;
}
private function CountLayers(givenArray : String[]) //return number of all layers without empty ones
{
	var givenArrayList = givenArray.ToList();
	var count : int=0;
	for (var i=0; i<32; i++)
		if (!LayerMask.LayerToName(i).Equals("")&& !givenArrayList.Contains(LayerMask.LayerToName(i)))
			count++;
	return count;
}
private function GetLayerArray(givenArray : String[]) //return list with layers without empty ones 
{	
	var givenArrayList = givenArray.ToList();
	var array : List.<String> = new List.<String>();
	for (var i=0; i<32; i++)
		if (!LayerMask.LayerToName(i).Equals("") && !givenArrayList.Contains(LayerMask.LayerToName(i)))
			array.Add(LayerMask.LayerToName(i));
	
	return array;
}
private function SetLayer(index: int, name : String) //function will assign layer name at given index
{
	var tagManager : SerializedObject = new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/TagManager.asset")[0]);
	 
	var it : SerializedProperty = tagManager.GetIterator();
	var showChildren : boolean = true;
	while (it.Next(showChildren))
	{
		if (it.name == "layers")
			it.GetArrayElementAtIndex(index).stringValue = name;
	}
	tagManager.ApplyModifiedProperties(); 
	return index;
}