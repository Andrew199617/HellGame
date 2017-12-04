//////////////////////////////////////////////////////////////////
// This script handle lava projectiles generation:              //
// - at the beginning of the game, randomly generate projectiles//                                   
// - generate lava projectiles only under the lava              //
//////////////////////////////////////////////////////////////////

var terrain : Terrain;         // terrain, to which you will assign lava
var projectile : GameObject;   // lava projectile prefab
var numberOfProjectiles : int; // how many should be lava projectiles

private var _WATCHDOG : int;   // cycles after which while loop will exit
//randomize variables
private var rect : Rect;
private var potencialX : float;
private var potencialZ : float;
private var terrainPositionY : float;
//health variables
function Start()
{
	if (terrain == null)
	{
		Debug.LogError(this + " Terrain field is missing. Script won't be launched");
		return;
	}
	_WATCHDOG = 100; 
	if (gameObject.GetComponent(Renderer)==null)
	{
		Debug.LogError(this + ": There is no lava surface added to this game object. Projectiles won't be instantiate.");
		return;
	}
	terrainPositionY =  terrain.transform.position.y;
	//creating lava projectiles folder in Hierarchy
	var projectilesChildren = new GameObject();
	projectilesChildren.name = "projectiles_" + transform.name;
	//prepare data for randomize
	rect.x = gameObject.transform.position.x;
	rect.y = gameObject.transform.position.z;
	rect.width = gameObject.GetComponent(Renderer).bounds.size.x+gameObject.transform.position.x;
	rect.height = gameObject.GetComponent(Renderer).bounds.size.z+gameObject.transform.position.z;
	
	// instantiate lava projectiles
	for (var i=0;i<numberOfProjectiles;i++)
	{
		var validation = _WATCHDOG;
		//we will random position for projectiles
		potencialX = Random.Range(rect.x, rect.width);
		potencialZ = Random.Range(rect.y, rect.height);
		while(terrain.SampleHeight(Vector3(potencialX,transform.position.y,potencialZ))+terrainPositionY >transform.position.y)
		{
			if (validation<=0)
			{
				Debug.Log(this + ": Could not found place for projectile in reasonable time!");
				break;
			}
			//if projectile is under the terrain, try generate position again
			potencialX = Random.Range(rect.x, rect.width);
			potencialZ = Random.Range(rect.y, rect.height);
			validation--;
		}
		//Instantiate it!
		var startPosition : Vector3 = Vector3(potencialX ,transform.position.y,potencialZ);
		var tempProjectile : GameObject = Instantiate(projectile, startPosition, transform.rotation);
		tempProjectile.transform.parent = projectilesChildren.transform;
		var script = tempProjectile.GetComponent(LavaShot);
		script.startPosition = startPosition;
		
	}
}