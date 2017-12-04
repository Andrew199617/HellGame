////////////////////////////////////////////////////////////////////////
// This script handle lava surface moving:                            //
// - calculate flow direction by given angle value                    //                                   
// - calculate speed for shore tex and main tex by given speeds value //
// - calculate lava waving by given cycle value                       //
// - pass calculated data do LavaShader shader                        //
////////////////////////////////////////////////////////////////////////
var speedMainTex: float = 1;         //[m/s]
var speedShoreTex: float = 0.1;      //[m/s]
var angleDirection: float = 0;       //[deg]
var lavaWavesDuration: float = 6;    //[sec]
var lavaWavesAmplitude : float = 1.5;//[m]

private var render : Renderer;
private var offsetMainTex : float;
private var offsetShoreTex : float;
private var vectorDirection : Vector4;
private var height : float;
private var validate : boolean;
function Start()
{
	//get game object renderer
	render = gameObject.GetComponent.<Renderer>();
	if (render==null)
	{
		Debug.LogError(this + ": There is no lava surface added to this game object. Scrolling won't work.");
		return;
	}
	validate = true;
}
function FixedUpdate() {
	//if there is not validation, do not execute script
	if (!validate)
		return;
	//calculate height from wave equation
	height = (lavaWavesAmplitude)*Mathf.Sin(Time.time*(2*Mathf.PI/(lavaWavesDuration)));
	//temps
	var sin : float = Mathf.Sin(angleDirection*Mathf.Deg2Rad);
	var cos : float = Mathf.Cos(angleDirection*Mathf.Deg2Rad);
	var tilingMain : Vector2 = render.material.GetTextureScale("_MainTex");
	var tilingShore : Vector2  = render.material.GetTextureScale("_BlendTex");
    offsetMainTex = Time.time * speedMainTex;
    offsetShoreTex = Time.time * speedShoreTex;
    //calc direction and speed basing on given angle and speed
	vectorDirection = Vector4(sin,0,cos,speedMainTex*10)*Mathf.Sign(speedMainTex);
	//set calculated data
	render.material.SetTextureOffset ("_MainTex", Vector2(sin*tilingMain.x*(-offsetMainTex/100),cos*tilingMain.y*(-offsetMainTex/100)));
    render.material.SetTextureOffset ("_BlendTex", Vector2(sin*tilingShore.x*(-offsetShoreTex/100),cos*tilingShore.y*(-offsetShoreTex/100)));
	render.material.SetFloat("_LavaShoreHeight",height);
	render.material.SetVector("_LavaFlowDirection",vectorDirection);
}