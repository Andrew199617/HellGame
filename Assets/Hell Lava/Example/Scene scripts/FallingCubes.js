////////////////////////////////////////////////////////////////
// Instantiate cubes:                                          //
// - instantiate cubes every [timeInterval] sec                //
// - rand cube rotation                                       //
// - move back and forward                                    //
////////////////////////////////////////////////////////////////
#pragma strict

var cubePrefarb : GameObject;
var timeInterval : float;

private var LavaTriggerScript : LavaTrigger[];
private var rotation : Vector3;
private var timer : float;
private var counter : int;
private var speed : float = 10;
private var moveTime : float = 10;
private var moveTimer : float;
private var state : int=1;
private var direction : Vector3;

private var cubes : GameObject;
function Start () 
{
	cubes = new GameObject();
	cubes.name = "cubes";
	timer = timeInterval;
	LavaTriggerScript = FindObjectsOfType.<LavaTrigger>();
}

function Update () {
	//moving handler
	if (moveTimer>0)
		moveTimer-=Time.deltaTime;
	if (moveTimer<=0 && state==1)
	{
		direction = Vector3.forward;
		moveTimer = moveTime;
		state =2;
	}
	if (moveTimer<=0 && state==2)
	{
		direction = -Vector3.forward;
		gameObject.transform.Translate(-Vector3.forward * speed * Time.deltaTime, Space.World);
		moveTimer = moveTime;
		state =1;
	}
	gameObject.transform.Translate(direction * speed * Time.deltaTime, Space.World);
	
	//timer for cube instantiate
	if (timer>0)
		timer -= Time.deltaTime;
	//if timer has ended it counting, instantiate cube, rand it rotation and assign name
	if (timer <=0)
	{
		var cube = Instantiate(cubePrefarb, transform.position, cubePrefarb.transform.rotation) as GameObject;
		rotation.x = Random.Range(-360, 360);
		rotation.y = Random.Range(-360, 360);
		rotation.z = Random.Range(-360, 360);
		cube.transform.eulerAngles = rotation;
		cube.transform.parent = cubes.transform;
		cube.name = cubePrefarb.name + "_" + counter.ToString();
		cube.GetComponent.<CubeHandler>().LavaTriggerScript = LavaTriggerScript;
		timer = timeInterval;
		counter++;
	}
}