//////////////////////////////////////////////////////////////////////////////////////
// This script draws flames texture animation on screen:                            //
// - animation can be launched from other script                                    //
// - animation can be launched from other script for some time                      //
//////////////////////////////////////////////////////////////////////////////////////
import UnityEngine.UI;

var showSpeed : float = 400; //Flame show speed [pixel/sec]

private var flameImage : Image;
private var rectTransform : RectTransform;
private var timer : float;

private static var m_Instance : FireUIHandler = null;
// Singleton using for FireUIHandler static access
static function Get() : FireUIHandler
{
    if (m_Instance == null)
        m_Instance = FindObjectOfType(FireUIHandler);
    return m_Instance;
}

function Start () {
    flameImage    = GetComponent.<Image>();
    rectTransform = GetComponent.<RectTransform>();
    rectTransform.sizeDelta = new Vector2(Screen.width, Screen.height);
}

function Update () {
    var sizeDelta : Vector2 = rectTransform.sizeDelta;
    var speed : Vector2 = Vector2(showSpeed * ((Screen.width+0.0) / Screen.height), showSpeed);
    if (timer>0)
    {           
        if (sizeDelta.x - speed.x * Time.deltaTime > 0)
            sizeDelta.x -= speed.x * Time.deltaTime;
        else
            sizeDelta.x = 0;

        if (sizeDelta.y - speed.y * Time.deltaTime > 0)
            sizeDelta.y -= speed.y * Time.deltaTime;
        else
            sizeDelta.y = 0;

        timer -= Time.deltaTime;
    }
    else
    {
        if (sizeDelta.x + speed.x * Time.deltaTime < Screen.width)
            sizeDelta.x += speed.x * Time.deltaTime;
        else
            sizeDelta.x = Screen.width;

        if (sizeDelta.y + speed.y * Time.deltaTime < Screen.height)
            sizeDelta.y += speed.y * Time.deltaTime;
        else
            sizeDelta.y = Screen.height;
    }
    if (!Mathf.Approximately(Screen.width - sizeDelta.x,0))
        flameImage.color = new Color(flameImage.color.r, flameImage.color.g, flameImage.color.b, 0.75f + 2*(Screen.width - sizeDelta.x) / (Screen.width*2));
    else
        flameImage.color = new Color(flameImage.color.r, flameImage.color.g, flameImage.color.b, 0);
    rectTransform.sizeDelta = sizeDelta;
}

// Launch UI flames constantly. It is good do use this function for example in Update method.
function LaunchFlames()
{
    timer = 0.1f;
}
function LaunchFlames(time : float)
{
    timer = time;
}

