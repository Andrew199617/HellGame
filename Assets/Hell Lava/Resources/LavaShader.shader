// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Custom/Lava" 
{ 
	Properties 
	{ 		
		_Color ("Main color", Color) = (1,1,1,0) 
		_MainEmission ("Main emmision",  Range(0,10)) = 0
		_MainTex ("Main (RGB)", 2D) = "white" {}
		
		_ColorShore ("Shore color", Color) = (1,1,1,1)
		_ShoreEmission ("Shore emmision",  Range(0,10)) = 0
		_BlendTex ("Shore (RGB)", 2D) = "white"{}
		
		_LavaShoreHeight("Lava shore height",  float) = 0
		_LavaShoreIntensity("Lava shore intensity",  Range (0.0, 1.0)) = 0.5
		_Heat ("Heat power", Range (0.00, 100.0)) = 80.0
		_FlowLevel ("Lava Flow level", Range (0.001, 1.0)) = 1.0
				
		[HideInInspector]_LavaFlowDirection("Lava flow direction", Vector) = (0.1,0.1,0.1,5)	
	}

	SubShader 
	{ 
		pass 
		{
			Tags {"RenderType" = "Opaque" "Queue"="Transparent"}
			
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			#pragma multi_compile_fog
			#pragma enable_d3d11_debug_symbols
			
			#include "UnityCG.cginc"
			
			uniform sampler2D _MainTex; 
			uniform sampler2D _BlendTex;
			uniform fixed4 _Color;
			uniform fixed4 _ColorShore;
			uniform fixed _MainEmission;
			uniform fixed _ShoreEmission;
			uniform half _LavaShoreHeight;
			uniform fixed4 _LavaFlowDirection;
			uniform fixed _LavaShoreIntensity;
			uniform half _Heat;
			uniform fixed _FlowLevel;
			struct Input
			{ 
				half4 vertex : POSITION;
				fixed4 color : COLOR;
				fixed4 texcoord : TEXCOORD0;
				fixed4 texcoord1 : TEXCOORD1;
				fixed3 normal : NORMAL;
			};
			struct Output {
				half4 vertex : SV_POSITION;
				fixed4 color : COLOR;
				fixed2 texcoord : TEXCOORD0;
				fixed2 texcoord1 : TEXCOORD1;
				UNITY_FOG_COORDS(2)
			};
					
			half4 _MainTex_ST;
			half4 _BlendTex_ST;
			Output vert (Input IN) 
			{
	         	Output o;
	         	o.color = IN.color;
	         	o.vertex = UnityObjectToClipPos(IN.vertex);
				fixed alpha = IN.color.a;
				// flow UV offset
	         	IN.texcoord.x +=sin(alpha*_FlowLevel);	
				
				// shore elevation offset				
				o.vertex.y -= _LavaShoreHeight*alpha;
	         	
	         	// Calculata alpha basing on normals and mesh vertices alpha. Alpha is kind of 
	         	// weight for us to calculate blend level between shore texture and main texture.
	         	fixed dotProduct = dot(IN.normal*IN.color.a*_LavaFlowDirection.w*_LavaShoreIntensity*10, _LavaFlowDirection.xyz); 	         	
	         	if (dotProduct>=0.1)
	         		alpha += alpha *dotProduct;
	         	
	         	// waving UV vertices offset			
	         	if (IN.color.a<0.9)
	         		IN.color.a = (1-_Color.a);
	         	alpha = clamp(alpha+IN.color.a,0,1);	
	         	
	         	// save new alpha and texcoords     	
				o.color.a = alpha;
				o.texcoord = TRANSFORM_TEX(IN.texcoord,_MainTex);
				o.texcoord1 = TRANSFORM_TEX(IN.texcoord1,_BlendTex);
				
				UNITY_TRANSFER_FOG(o,o.vertex);
	      		return o;
	      	}
			fixed4 frag (Output i) : SV_Target
			{				
				// waving Mesh vertices offset
				i.texcoord.x += sin(_Heat*_Time.y - i.texcoord.y/ _MainTex_ST.y * _Heat)*0.0005* _MainTex_ST.x;
				i.texcoord1.x += sin(_Heat*_Time.y - i.texcoord1.y / _BlendTex_ST.y * _Heat)*0.0005* _BlendTex_ST.x;
				// draw texture using given color, emmision and calculated alpha in vert part
				fixed alpha=i.color.a* _ColorShore.a;
	         	fixed4 main = tex2D(_MainTex,  i.texcoord)   * (1-alpha)*    _Color   * _MainEmission;
				fixed4 shore = tex2D(_BlendTex, i.texcoord1) *   alpha  * _ColorShore * _ShoreEmission;
				fixed4 final =  main + shore;
				UNITY_APPLY_FOG(i.fogCoord, final);
			    
				return  final;
	        }	
			ENDCG
		}
	}

	Fallback "Diffuse" 
}