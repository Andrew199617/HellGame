using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour
{
    private int health = 100;

    public void Update()
    {
        if (health < 0)
        {
            GameOver();
        }
    }

    private void GameOver()
    {

    }
}
