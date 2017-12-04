////////////////////////////////////////////////////////////
// This script handle the flying of object:               //
// - moving player forward, backward, up and down         //
////////////////////////////////////////////////////////////
#pragma strict
var speed : float = 15; //movement speed
var rushKey : KeyCode = KeyCode.LeftShift;

private var moveDirection : Vector3;           //move direction, that we will calculate
private var controller : CharacterController;  //script will automatic determine where is Character Controller
	
function Start()
{
	//determine the Character Controller
	controller = GetComponent.<CharacterController>();
}
function Update() {	
	var modedSpeed : float;
	if (Input.GetKey(rushKey))
		modedSpeed = 4*speed;
	else
		modedSpeed = speed;
	//forward and backward  
	moveDirection.z =Input.GetAxis("Vertical")*modedSpeed;
	//left and right
	moveDirection.x =Input.GetAxis("Horizontal")*modedSpeed;
	//up and down
	moveDirection.y =(Camera.main.transform.TransformDirection(Vector3.forward).y*Input.GetAxis("Vertical"))*modedSpeed;
		
	//act of move			
	moveDirection = transform.TransformDirection(moveDirection);
	controller.Move(moveDirection * Time.deltaTime);
}

function OnTriggerStay(coll : Collider){
}