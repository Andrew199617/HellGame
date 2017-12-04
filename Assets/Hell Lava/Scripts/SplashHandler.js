////////////////////////////////////////////////////////////////
// This script handle splash particle:                        //
// - validate  prefab                                        //
// - destroy main object when all particles living is over    //
// - keeps its start rotation                                 //
// - option: destroy after given time                         //
////////////////////////////////////////////////////////////////
var destroy : boolean;      //destroy order
var timedDestroy : float=0; //timed destroy order
private var startRotation : Quaternion;
private var particleSystems : ParticleSystem[];

function Start()
{
	//save original rotation
	startRotation = transform.rotation;
	//get all particle systems
    particleSystems = GetComponentsInChildren.<ParticleSystem>();
}
function Update () {
	//hold original rotation
	transform.rotation = startRotation;

    //simple timer for timed destroy order
    if (timedDestroy > 0)
        timedDestroy -= Time.deltaTime;
    else if (timedDestroy < 0)
        destroy = true;
    //if destroy is true, particle systems will be stopped
	
}

function FixedUpdate()
{
    var someIsStillAlive: boolean;

    for (var ps: ParticleSystem in particleSystems)
    {
        var psMain: ParticleSystem.MainModule = ps.main;
        psMain.loop = !destroy;

        if (ps.IsAlive())
            someIsStillAlive = true;
    }
    //if both particles are no longer alive, destroy gameobject
    if (!someIsStillAlive && destroy)
        Destroy(gameObject);
}