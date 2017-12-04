///////////////////////////////////////////////////////////////
// Personal UI flames launcher for player.                   //
// - checks if player is owner of object in multiplayer      //
// - checks if UI flame handler exists </para>               //
///////////////////////////////////////////////////////////////

public var allow : boolean = true; //Allows script to be launched.
@HideInInspector
public var launch : boolean; //Launcher.
@HideInInspector
public var timedLaunch : float; // Timed launcher. Script will work for given time.

private var player : InLava;

function Update()
{
    if (!allow)
        return;

    if ((launch || timedLaunch>0) && FireUIHandler.Get()!=null )
    {
        FireUIHandler.Get().LaunchFlames();
        if (timedLaunch>0)
            timedLaunch -= Time.deltaTime;
    }
}