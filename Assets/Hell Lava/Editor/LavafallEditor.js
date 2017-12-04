@CustomEditor(Lavafall)
@CanEditMultipleObjects
class LavafallEditor extends Editor {
	var lavafallScript : Lavafall;
	var releaseTime : SerializedProperty;
	var stuckTime : SerializedProperty;
	var HeightDiff : SerializedProperty;
	var instantiateDelay : SerializedProperty;
	var damage : SerializedProperty;  
	var lavaParticle : SerializedProperty;
	var soundLoop : SerializedProperty;
	var particleActualNumber : SerializedProperty;
	
	private var HealthScript_fields : System.Reflection.FieldInfo[]; 
	private var HealthScript_type : System.Type;  
	private var HealthScript_fieldsStr : String[]; 
	
	function OnEnable () {
		lavafallScript = target as Lavafall;
		releaseTime = serializedObject.FindProperty("releaseTime");
		stuckTime = serializedObject.FindProperty("stuckTime");
		HeightDiff = serializedObject.FindProperty("HeightDiff");
		instantiateDelay = serializedObject.FindProperty("instantiateDelay");
		damage = serializedObject.FindProperty("damage");
		lavaParticle = serializedObject.FindProperty("lavaParticle");
		soundLoop = serializedObject.FindProperty("soundLoop");
		particleActualNumber =  serializedObject.FindProperty("particleActualNumber");
	}
	function OnInspectorGUI() {	
		serializedObject.Update ();
		
		EditorGUILayout.LabelField("Lavafall config: ");
		
		EditorGUI.indentLevel++;
		EditorGUILayout.PropertyField(releaseTime, new GUIContent("Release time","Time after new lavaParticle will be created."));
		lavafallScript.releaseTime=releaseTime.floatValue;
		
		EditorGUILayout.PropertyField(stuckTime, new GUIContent("Stuck time","Time to destroy lavaRiver after it has been considered as stuck."));
		lavafallScript.stuckTime=stuckTime.floatValue;
		
		EditorGUILayout.PropertyField(HeightDiff, new GUIContent("Height difference","Minimum height that lavaRiver have to pass to not be considered as stuck."));
		lavafallScript.HeightDiff=HeightDiff.floatValue;
		
		EditorGUILayout.PropertyField(instantiateDelay, new GUIContent("Shadow spawn intervals","During falling of lavaRiver, time interval between instantiating shadows."));
		lavafallScript.instantiateDelay=instantiateDelay.floatValue;
		
		
		EditorGUILayout.PropertyField(damage, new GUIContent("Damage","Damage that lavaRiver deals to object with health."));
		lavafallScript.damage=damage.floatValue;
		EditorGUI.indentLevel--;
		EditorGUILayout.LabelField("Prefabs: ");
		EditorGUI.indentLevel++;
		EditorGUILayout.PropertyField(lavaParticle, new GUIContent(" - Particle"));
		lavafallScript.lavaParticle=lavaParticle.objectReferenceValue;
		EditorGUILayout.PropertyField(soundLoop, new GUIContent(" - Steam loop"));
		lavafallScript.soundLoop=soundLoop.objectReferenceValue;
		
		EditorGUI.indentLevel--;
		EditorGUILayout.LabelField("Info: ");
		EditorGUI.indentLevel++;
		GUI.enabled = false;
		EditorGUILayout.PropertyField(particleActualNumber, new GUIContent(" - Particles Count","Number of actual particles existing under this lavafall management."));
		GUI.enabled = true;
		lavafallScript.particleActualNumber=particleActualNumber.intValue;
		
		EditorGUI.indentLevel--;
		serializedObject.ApplyModifiedProperties ();
    }    		
		
}