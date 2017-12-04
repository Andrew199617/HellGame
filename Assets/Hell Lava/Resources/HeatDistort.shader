// based on the Unity shader GlassStainedBumpDistort
Shader "Custom/Heat Distort" {
	Properties{
		_BumpAmt("Distortion", range(0,128)) = 10
		_BumpMap("Distortion texture", 2D) = "bump" {}
	}
	Category
	{	
		Tags
		{ 
			"Queue" = "Overlay"
			"RenderType" = "Transparent" 
		}
		SubShader
		{
			GrabPass
			{
				Name "BASE"
				Tags{ "LightMode" = "Always" "RenderType" = "Transparent" }
			}
			Pass
			{
				Name "BASE"
				Tags{ "LightMode" = "Always" "RenderType" = "Transparent" }
				CGPROGRAM
					#pragma vertex vert
					#pragma fragment frag
					#include "UnityCG.cginc"

					struct appdata_t {
						float4 vertex : POSITION;
						float2 texcoord: TEXCOORD0;
						fixed4 color: COLOR;
					};

					struct v2f {
						float4 vertex : SV_POSITION;
						float4 uvgrab : TEXCOORD0;
						float2 uvbump : TEXCOORD1;
						fixed4 color : COLOR;
					};

					float _BumpAmt;
					float4 _BumpMap_ST;

					v2f vert(appdata_t v)
					{
						v2f o;
						o.vertex = UnityObjectToClipPos(v.vertex);
						o.uvgrab = ComputeGrabScreenPos(o.vertex);
						o.uvbump = TRANSFORM_TEX(v.texcoord, _BumpMap);
						o.color = v.color;
						UNITY_TRANSFER_FOG(o,o.vertex);
						return o;
					}

					sampler2D _GrabTexture;
					float4 _GrabTexture_TexelSize;
					sampler2D _BumpMap;

					half4 frag(v2f i) : SV_Target
					{
						#if UNITY_SINGLE_PASS_STEREO
							i.uvgrab.xy = TransformStereoScreenSpaceTex(i.uvgrab.xy, i.uvgrab.w);
						#endif

						// calculate perturbed coordinates
						half2 bump = UnpackNormal(tex2D(_BumpMap, i.uvbump)).rg; // we could optimize this by just reading the x & y without reconstructing the Z
						float2 offset = bump * _BumpAmt * _GrabTexture_TexelSize.xy;
						#ifdef UNITY_Z_0_FAR_FROM_CLIPSPACE //to handle recent standard asset package on older version of unity (before 5.5)
							i.uvgrab.xy = offset * UNITY_Z_0_FAR_FROM_CLIPSPACE(i.uvgrab.z) + i.uvgrab.xy;
						#else
							i.uvgrab.xy = offset * i.uvgrab.z + i.uvgrab.xy;
						#endif

						half4 col = tex2Dproj(_GrabTexture, UNITY_PROJ_COORD(i.uvgrab));

						col.a = i.color.r * i.color.g + i.color.b;
						return col;
					}
				ENDCG
			}
		}

		// Fallback for older cards
		SubShader{
			Blend DstColor Zero
			Pass
			{
				Name "BASE"
			}
		}
	}
}
