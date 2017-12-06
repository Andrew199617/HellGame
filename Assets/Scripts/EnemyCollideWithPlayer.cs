using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityStandardAssets.Characters.ThirdPerson;

public class EnemyCollideWithPlayer : MonoBehaviour {

    private void OnCollisionEnter(Collision other)
    {
        if (other.transform.CompareTag("Player"))
        {
            transform.Find("PatrolEnemy").GetComponent<AICharacterControl>().IsHit();
        }
    }

}
