﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour {

    public void QuitGame()
    {
        Application.Quit();
    }

    //Can be used for Retry.
    public void OpenGame()
    {
        SceneManager.LoadScene("Hell Game Prototype 1");
    }

    public void ExitToMainMenu()
    {
        SceneManager.LoadScene("TitleScreen");
    }

}
