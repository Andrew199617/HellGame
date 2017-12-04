////////////////////////////////////////////////////////////////
// This script generates steam loop sound                     //
// - checks if audioSource is attached                        //
// - smooth volume up at born                                //
// - smooth volume down at death                             //
// - option: destroy after given time                         //
////////////////////////////////////////////////////////////////
var destroy : boolean;
var timedDestroy : float=0;
var damping : float=0.1; //volume unit per second

private var rand : System.Random = new System.Random();
private var audioSource : AudioSource;
private var launch : boolean;
private var volume : float;

function Start()
{
	//find audio source.
	audioSource = gameObject.GetComponent.<AudioSource>();
	if (audioSource == null)
		Debug.LogWarning(this + ": There is no AudioSource attached. Sound won't be generated.");
	else
	{
		launch = true;
		volume = audioSource.volume;
		audioSource.volume=0;
	}
}
function Update()
{
	//simple timer
	if (timedDestroy>0)
		timedDestroy-=Time.deltaTime;
	else if (timedDestroy<0)
		destroy=true;
			
	//if there was launch order, level up volume smoothly to audio source volume level
	if (launch && !destroy && audioSource.volume<volume)
		audioSource.volume+=damping*Time.deltaTime;
	
	//if there was destroy order, level down volume smoothly and then destroy
	if (destroy)
	{ 
		if (audioSource.volume>0)
			audioSource.volume-=damping*Time.deltaTime;
		else
			Destroy(gameObject);
	}
		
}
//generate sound
function OnAudioFilterRead(data : float[], channels : int)
{
	if (launch) //if launch order
    	for (var i = 0; i<data.Length; i++) //generate white noise
    		data[i] = -1f + rand.NextDouble()*2f;
}

