import UnityEngine.UI;
////////////////////////////////////////////////////////////////
// This script handle objects health:                         //
// - display current health for player                        //
// - display player lava status                               //
// - display lava status                                      //
// - display control                                          //
////////////////////////////////////////////////////////////////
public var player : GameObject;      //Player gameObject.
public var canvasGrup : CanvasGroup; //Reference to main canvas group
public var hideKey : KeyCode;        // Key which pressed will hide HUD.

public var currentSet : InputField; // Reference to current set display.

public var HP : InputField;               // Reference to HP display. 
public var playerInLava : InputField;     // Reference to player in lava display. 
public var playerDiedInLava : InputField; // Reference to player died in lava display.  
public var objectsInLava : InputField;    // Reference to objects in lava display. 
public var playersInLava : InputField;    // Reference to player in lava display.

public var movement : InputField;  // Reference to movement display.
public var sprint : InputField;    // Reference to sprint display. 
public var changeSet : InputField; // Reference to changeSet display
public var hideHUD : InputField;   // Reference to hideHUD display. 

private var exampleHanderScript : ExampleHandler;  // example Handler script reference
private var LavaTriggerScript : LavaTrigger[];     // lava trigger engine
private var flyScript : Fly;                       // player fly handler script reference
private var healthScript : Health;                 // player health script reference
function Start()
{        
    // get references to scripts
    exampleHanderScript = FindObjectsOfType.<ExampleHandler>()[0];
    LavaTriggerScript = FindObjectsOfType.< LavaTrigger > ();
    flyScript = player.GetComponent.<Fly>();
    healthScript = player.GetComponent.<Health>();
}
function FixedUpdate()
{
    // handle hide HUD on key pressed
    if (Input.GetKeyDown(hideKey) && canvasGrup.alpha == 0)
        canvasGrup.alpha = 1;
    else if (Input.GetKeyDown(hideKey) && canvasGrup.alpha == 1)
        canvasGrup.alpha = 0;

    // handle current set display
    currentSet.text = exampleHanderScript.lavaViewModes[exampleHanderScript.GetDisplayIndex()].name;

    // handle Hell Lava info display
    var isPlayerInLava : boolean= false;
    var playerDiedInLava : boolean = false;
    var objectsInLava : int = 0;
    var playersInLava : int = 0;
    for (var i = 0; i < LavaTriggerScript.Length; i++)
    {
        if (LavaTriggerScript[i].IsPlayerInLava(player))
            isPlayerInLava = true;
        if (LavaTriggerScript[i].PlayerDiedInLava(player))
            playerDiedInLava = true;
        objectsInLava += LavaTriggerScript[i].ObjectsInLava().Count;
        playersInLava += LavaTriggerScript[i].PlayersInLava().Count;
    }
    HP.text = healthScript.currentHealth.ToString("F0");
    playerInLava.text = isPlayerInLava.ToString();
    this.playerDiedInLava.text = playerDiedInLava.ToString();
    this.objectsInLava.text = objectsInLava.ToString();
    this.playersInLava.text = playersInLava.ToString();

    // handle control set display
    movement.text = "A/W/S/D";
    sprint.text = flyScript.rushKey.ToString();
    changeSet.text = exampleHanderScript.switchKey.ToString();
    hideHUD.text = hideKey.ToString();

}