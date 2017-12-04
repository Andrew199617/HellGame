////////////////////////////////////////////////////////////////////////////
// Handle looking around, using mouse.                                    //
// - keeps camera position at predefined local position </para>           //
////////////////////////////////////////////////////////////////////////////

var sensitivityX : float = 10F;
var sensitivityY : float = 10F;
var minimumY : float= -80F;
var maximumY : float = 80F;
	
private var rotationY : float;

function Update ()
{
	Camera.main.transform.localPosition = Vector3(0,1.12,0.2);
	rotationY += Input.GetAxis("Mouse Y") * sensitivityY;
	rotationY = Mathf.Clamp (rotationY, minimumY, maximumY);
	transform.Rotate(0, Input.GetAxis("Mouse X") * sensitivityX, 0);
	Camera.main.transform.localEulerAngles = new Vector3(-rotationY, 0, 0);
}
