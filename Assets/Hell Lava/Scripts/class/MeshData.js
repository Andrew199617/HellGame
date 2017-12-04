import System.IO;
////////////////////////////////////////////////////////////////
// This class represents whole lava data:                     //
// - loads default data                                       //
// - saves and load data from asset                           //
// - sample mesh height at given location                     //               
//////////////////////////////////////////////////////////////// 
class MeshData extends ScriptableObject
{
	var terrainPath : String;             // Terrain, to which you will assign lava
	var material : Material;              // lava material
	var width : int;			          // lava mesh width
	var height : int;                     // lava mesh height
	var dist : float;                     // distance between two vertices. Set value to this variable different than 0, if you don't want to let it calculate automatically
			
	var roundStep : float; 		          // Step between degrees. Less mean more precision but it takes more time to generate lava surface
	var antialiasingLevel : int;          // antialiasing level. Usually 50 is enough. 
	var steepness : float;                // lava lift steepness. Lower value mean lower steepnes. 1 is default
	var lavaElevation : float;            // the value of which lava will be raised at the terrain shore
	var autoDist : boolean;               // calc distance automatically?	
	var isConfigured : boolean;           // was the lava configured?
	
	// initialize default data
	function DefaultInit()
	{
		roundStep = 1f;
		antialiasingLevel = 50;
		steepness = 1f;
		lavaElevation = 3f;
		autoDist = true;
		if (UnityEngine.Terrain.activeTerrain!=null)
			terrainPath = GetPath(UnityEngine.Terrain.activeTerrain.transform);
		material = Resources.Load("Materials/lavaMaterial", Material);
		if (material==null)
			Debug.LogWarning(this + ": Could not find default lava material");
		
	}
	// transform terrain path string to terrain component
	function Terrain()
	{
		var temp : GameObject = GetObject(terrainPath);
		if (terrainPath != null && terrainPath != "")	
		{	
			if (temp != null)	
				return temp.GetComponent.<Terrain>() as Terrain;
			else
				return null;	
		}
		else
			return null;
	}
	// transform terrain component to path string
	function Terrain(terrain : Terrain)
	{
		if (terrain == null)
			this.terrainPath = "";
		else
		{
			var path = GetPath(terrain.transform);
			this.terrainPath = path;
		}
	}
	//assign data to new object
	function Assign(toCopy : MeshData)
	{
		terrainPath = toCopy.terrainPath;
		material = toCopy.material;
		width = toCopy.width;
		height = toCopy.height; 
		dist = toCopy.dist;
		
		roundStep = toCopy.roundStep;
		antialiasingLevel = toCopy.antialiasingLevel;
		steepness = toCopy.steepness;
	    lavaElevation = toCopy.lavaElevation;
		autoDist = toCopy.autoDist;	
		isConfigured = toCopy.isConfigured;
	}
	// this method will save data to asset. Works only when in edit mode
	#if UNITY_EDITOR
	function CreateAsset(path : String, name : String)
	{
		var asset : MeshData = ScriptableObject.CreateInstance.<MeshData>();
		asset.Assign(this);	

		AssetDatabase.DeleteAsset(Path.Combine(path,name+"_data.asset") ); 
		AssetDatabase.CreateAsset(asset, path+name+"_data.asset" ); 
		AssetDatabase.SaveAssets();
	}
	#endif
	//this method will load data from asset
	function LoadAsset(path : String, name : String)
	{
		var temp : MeshData = Resources.Load(Path.Combine(path,name+"_data"), MeshData);
		if (temp==null)
			return false;
		else
		{
			this.Assign(temp);
			return true;
		}
	}
	//special method that will sample height at given position and also return additional
	//info like collider distance to surfce  
	function SampleHeight(pos : Vector3, collider : Collider, LavaTriggerScript : LavaTrigger)
	{   
		var maxHeight : float = LavaTriggerScript.lavaTransform.position.y + lavaElevation + 1;
		var lavaCollider = LavaTriggerScript.lavaTransform.parent.GetComponent.<MeshCollider>();                                                               
		var rayLava : Ray = new Ray(Vector3(pos.x, maxHeight,pos.z), -Vector3.up);
		var hitLava : RaycastHit;
		
		if(lavaCollider.Raycast(rayLava,hitLava,Mathf.Infinity))
		{
			var rayColBottom : Ray = new Ray(Vector3(pos.x, hitLava.point.y, pos.z), Vector3.up);
			var hitColBottom : RaycastHit;
			var rayColTop : Ray = new Ray(Vector3(pos.x, maxHeight + collider.bounds.size.y, pos.z), -Vector3.up);
			var hitColTop : RaycastHit;
			if (collider.Raycast(rayColBottom, hitColBottom, Mathf.Infinity))
			{
				// Object above the lava surface. Return lava height at position and distance to lava surface.
				return Vector3(hitLava.point.y, hitColBottom.distance, 0); 
			}
			else if(collider.Raycast(rayColTop, hitColTop, Mathf.Infinity))
			{
				var dist = hitColTop.point.y - hitLava.point.y;
				// if dist>0 Object above the lava surface but in lava. 
				// if dist<=0 Object under the lava surface.
				//Return lava height at position and distance to full immersion.
				return Vector3(hitLava.point.y, dist, 1); 
			}
			else //error. Return at last lava position
			{
				return Vector3(hitLava.point.y, 1, 0);
			}
				
		}	
		return Vector3.zero; // error	
	}
	//local function that will return path on scene basing on given transform
	private function GetPath(transform : Transform)
	{
	    var path : String = transform.name;
		var transformCopy : Transform = transform;
		
	    while (transformCopy.parent != null)
	    {
	        transformCopy = transformCopy.parent;
	        path = transformCopy.name + "/" + path;
	    }
	    return path;
	}
	//function that will return game object basing on given path
	private function GetObject (path : String)
	{
		return GameObject.Find(path) as GameObject;
	}
	
}