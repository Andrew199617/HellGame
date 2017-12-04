///////////////////////////////////////////////////////////////////////////////////
// This script handle example scene:                                             //
// - checks if configuration is set for example scene                            //                                   
// - shows info if no configuration is not set                                   //
// - pass given gameObject to static variable "parentObject" in given MonoScript //
// - changes display of lava surface                                             //
///////////////////////////////////////////////////////////////////////////////////
@script ExecuteInEditMode()

@System.Serializable
//Contains lava display info.
public class LavaMode
{
    public var name : String; 		   //Name of the set.
    public var lavaMaterial :Material; //Material which will be assigned to lava surface. 
    public var lightColor : Color;     //Light color.
}
public var switchKey : KeyCode; 	   //Key that after pressed will initialize lava view change.
public var lavaViewModes : LavaMode[]; //Lava display modes. 
public var mainLava : GameObject;      //Reference to main lava game object.
public var smallLava : GameObject;     //Reference to small lava game object.
#if UNITY_EDITOR
public var lavaCreator : MonoScript;   // MonoScript to which will be pass object
#endif

private var actualDisplayIndex : int= 0;
private var mainLavaRenderer   : MeshRenderer;
private var smallLavaRenderer  : MeshRenderer;
private var mainLavaLights     : Light[];
private var smallLavaLights    : Light[];

private var lavaCreatorMono : String = "LavaCreator";
private var lavaCreator_fieldName : String = "parentObject";
private var lavaCreator_type: System.Type;  
private var lavaCreator_field : System.Reflection.FieldInfo;

// gets actual selected lava display index.
function GetDisplayIndex()
{
    return actualDisplayIndex;
}

function Start()
{
	// get references to components
    mainLavaRenderer = mainLava.GetComponent.<MeshRenderer>();
    smallLavaRenderer = smallLava.GetComponent.<MeshRenderer>();
    mainLavaLights = mainLava.GetComponentsInChildren.<Light>();
    smallLavaLights = smallLava.GetComponentsInChildren.<Light>();
	//load lava data from asset	
	#if UNITY_EDITOR
	var lavaData : MeshData= ScriptableObject.CreateInstance.<MeshData>();
	if (!lavaData.LoadAsset("Meshes", mainLava.name))
	{
		Debug.LogError(this + ": There is no saved asset for this '"+mainLava.name+"'. Did you changed name of lava parent object or changed some path? Reupload hell lava package or generate new surface from GameObject>Create Other>Lava environment.");
		DestroyImmediate(lavaData, false);
		return;
	}
	//if configuration was not set
	if (!lavaData.isConfigured)
	{
		//find LavaCreator type and parentObject field
		var assemblies : System.Reflection.Assembly[] = System.AppDomain.CurrentDomain.GetAssemblies();
		for(var assemblyName in assemblies)
		{
			if(assemblyName.GetType(lavaCreatorMono) != null)
			{
				lavaCreator_type = assemblyName.GetType(lavaCreatorMono);
				lavaCreator_field = lavaCreator_type.GetField(lavaCreator_fieldName);
			    break;
			}
		} 
		if (lavaCreator_type==null)
		{
			Debug.LogError(this + ": Could not pass parent object to Hell Lava Creator...");
			return;
		}
		//show info and pass variable
		Debug.LogWarning("WARNING! This is your first launch of the example scene! Before you can play it, you have to configure scene and project, so Hell Lava will work properly.\n\nFrom Unity top menu, select GameObject>Create Other>Lava environment and press 'Configure scene'. Function will add a few layers to your project and will assign them to objects on scene.");
		if (lavaCreator_field.GetValue(lavaCreator)==null)
		{
			PlayerPrefs.SetString("healthScriptMono", "Health");
			PlayerPrefs.SetString("healthScriptFieldName", "currentHealth");
			PlayerPrefs.SetInt("recognitionMode", 1);
			PlayerPrefs.SetString("recognitionString", "Health");
		}
		lavaCreator_field.SetValue(lavaCreator,mainLava); 
	}
	// free memory 
	DestroyImmediate(lavaData, false);
	#endif
}
 function Update()
 {
    if (Input.GetKeyDown(switchKey))
    {
        if (actualDisplayIndex + 1 >= lavaViewModes.Length)
            actualDisplayIndex = 0;
        else
            actualDisplayIndex++;
        mainLavaRenderer.material = lavaViewModes[actualDisplayIndex].lavaMaterial;
        smallLavaRenderer.material = lavaViewModes[actualDisplayIndex].lavaMaterial;
		var i : int;
        for (i = 0; i<mainLavaLights.Length; i++)
            mainLavaLights[i].color = lavaViewModes[actualDisplayIndex].lightColor;
        for (i = 0; i < smallLavaLights.Length; i++)
            smallLavaLights[i].color = lavaViewModes[actualDisplayIndex].lightColor;
    }
}