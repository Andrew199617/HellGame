////////////////////////////////////////////////////////
//                                                    //
//                 YOU ARE AWESOME!                   //                                                    
//                                                    //
//      ~~Thank you for buying Hell Lava Package ~~   // 
//                                                    //  
////////////////////////////////////////////////////////



This is short instruction how to install and configure Hell Lava package. If you want more detail, please read Hell Lava Documentation.pdf

1. Unpack Hell Lava Package.

2. In upper Unity menu go to GameObject>Create Other>Lava environment

3. Press "New" button next to "Parent Object" in Lava creator.

4. Fill missing fields:

- Type in Health MonoScript name of your health script (not required).
- In HP field name select variable that store current object HP (not required).
- Select whole object recognition system mode, that mean method by which Hell Lava will recognize "whole" object, for example characters, monsters etc. (not required).
- Drag 'Map/Terrain' from Hierarchy to Terrain in Lava creator
- In Height and Width type you lava size.

5. Press "Generate" and wait until process end.

6. Press "Assign" buttons. All of them can be added without config.

7. To add lavafalls, just drag lavafall.prefab from project Hell Lava>Resources>Prefabs wherever you want at scene. 
- In lavafall object inspector, set layer to IgnoreTrigCol. If layer do not exist, create one and select it.

8. Hell Lava can work in Multiplayer. Just add playerPack.prefab from project Hell Lava>Resources>Prefabs as child to your player object.

NOTE: Before using Hell Lava example scene, you have to go to GameObject>Create Other>Lava environment and press 
"Configure scene" button next to "Layers tool". This will assign necessary layers to your scene, so Hell Lava will work properly!

That's it! Enjoy your Hell Lava asset :).