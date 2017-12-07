using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour
{

    public int Health;
    public int Damage;
    //public Weapon weapon;

    /// <summary>
    /// Adds dmg to Helath.
    /// </summary>
    /// <param name="dmg"></param>
    public void ChangeHealthByAmount(int dmg)
    {
        Health += dmg;
    }


    public void Update()
    {
        if (Health <= 0)
        {
            GameOver();
        }
    }

    private void GameOver()
    {
        //Load UI for GameOver.
    }
}
