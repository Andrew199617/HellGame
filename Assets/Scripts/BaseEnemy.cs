using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityStandardAssets.Characters.ThirdPerson;

public class BaseEnemy : MonoBehaviour {

    public int Health;
    public int Damage;
    //public Weapon weapon;

    /// <summary>
    /// Subtract dmg to Helath.
    /// </summary>
    /// <param name="dmg"></param>
    public void ChangeHealthByAmount(int dmg)
    {
        Health -= dmg;

        if (dmg > 0)
        {
            GetComponent<AICharacterControl>().MyState = AICharacterControl.State.IsHit;
            Debug.Log("Hit");
        }
        if (Health <= 0)
        {
            StartCoroutine(Died());
            Debug.Log("Died");
        }
    }

    protected IEnumerator Died()
    {
        var aiController = GetComponent<AICharacterControl>();
        aiController.MyState = AICharacterControl.State.IsDead;
        aiController.IsDead = true;

        //After some delay destroy enemy
        yield return new WaitForSeconds(10);
        Destroy(gameObject);
    }
}
