//////////////////////////////////////////////////////////////////
// This script handle lava particle generation:                 //
// - at the beginning of the game, randomly generate sparkles    //                                   
// - generate lava sparkle only above the lava                  //
//////////////////////////////////////////////////////////////////

var terrain : Terrain;        // terrain, to which you will assign lava
var numberOfSparkles : int;   // how many should be lava particles
var sparkle : GameObject;     // lava projectile prefab

private var _WATCHDOG : int;  // cycles after which while loop will exit
//randomize variables
private var rect : Rect;
private var potencialX : float;
private var potencialZ : float;
private var terrainPositionY : float;
function Start()
{
	if (terrain == null)
	{
		Debug.LogError(this + " Terrain field is missing. Script won't be launched");
		return;
	}
	if (gameObject.GetComponent.<Renderer>()==null)
	{
		Debug.LogError(this + ": There is no lava surface added to this game object. Sparkles won't be instantiate.");
		return;
	}
	// cycles after which while loop will exit
	_WATCHDOG = 100;  
	terrainPositionY =  terrain.transform.position.y;
	//creating lava sparkles folder in Hierarchy
	var sparklesChildren = new GameObject();
	sparklesChildren.name = "sparkles";
	sparklesChildren.transform.parent = transform;
	//prepare data for randomize
	rect.x = gameObject.transform.position.x;
	rect.y = gameObject.transform.position.z;
	rect.width = gameObject.GetComponent.<Renderer>().bounds.size.x+gameObject.transform.position.x;
	rect.height = gameObject.GetComponent.<Renderer>().bounds.size.z+gameObject.transform.position.z;
	for (var i=0;i<numberOfSparkles;i++)
	{
		var validation = _WATCHDOG;
		//we will random position for sparkle particle prefab
		potencialX = Random.Range(rect.x, rect.width);
		potencialZ = Random.Range(rect.y, rect.height);
		while(terrain.SampleHeight(Vector3(potencialX,transform.position.y,potencialZ))+terrainPositionY >transform.position.y)
		{
			if (validation<=0)
			{
				Debug.Log(this + ": Could not found place for projectile in reasonable time!");
				break;
			}
			//if sparkle prefab potential position is under the terrain, try generate position again
			potencialX = Random.Range(rect.x, rect.width);
			potencialZ = Random.Range(rect.y, rect.height);
			validation--;
		}
		//Instantiate it!
		var tempSparkle : GameObject = Instantiate(sparkle, Vector3(potencialX ,transform.position.y+2,potencialZ), sparkle.transform.rotation);
		tempSparkle.transform.parent = sparklesChildren.transform;
		
	}
}