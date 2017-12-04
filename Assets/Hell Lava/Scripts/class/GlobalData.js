import System.IO;
////////////////////////////////////////////////////////////////
// This class represents Hell Lava Global data:               //
// - loads default data                                       //
// - saves and load data from asset                           //          
//////////////////////////////////////////////////////////////// 
class GlobalData extends ScriptableObject
{
    var healthScriptMono : String;       // Monoscript type.
    var healthScriptFieldName : String;  // Health script variable name, that definiec current object HP.   
    var recognitionIndex : int;          // Index of choosed recognition mode.
    var recognitionString : String;      // String by which recognition system will recognise whole object

    // Initialize default data.
    function DefaultInit()
    {
        healthScriptMono = "";
        healthScriptFieldName = "";
        recognitionIndex = 0;
        recognitionString = "";
    }

    // Copy another MeshData values to this one.
    function Assign(toCopy : GlobalData)
    {
        healthScriptMono = toCopy.healthScriptMono;
        healthScriptFieldName = toCopy.healthScriptFieldName;
        recognitionIndex = toCopy.recognitionIndex;
        recognitionString = toCopy.recognitionString;
    }

    /// Save data to asset. Works only when in edit mode.
    function CreateAsset(path : String, name : String)
    {
        #if UNITY_EDITOR
            var asset  = ScriptableObject.CreateInstance.<GlobalData>();
		    asset.Assign(this);	

		    AssetDatabase.DeleteAsset(Path.Combine(path, name+".asset" ) ); 
		    AssetDatabase.CreateAsset(asset, Path.Combine(path, name+".asset" ) ); 
		    AssetDatabase.SaveAssets();
        #endif
    }

    // Load asset from file.
    function LoadAsset(path : String, name : String)
    {
        var temp = Resources.Load(Path.Combine(path, name), GlobalData);
        if (temp == null)
            return false;
        else
        {
            Assign(temp);
            return true;
        }
    }
}