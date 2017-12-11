using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour
{

    public int Health;
    public int Damage;
    public GameObject Weapon;

    public bool IsAttacking { get; private set; }
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
        if (Input.GetKeyDown(KeyCode.Mouse0))
        {
            var animator = GetComponent<Animator>();
            animator.SetBool("IsAttacking",true);
            IsAttacking = true;
        }
    }

    public void CanHit()
    {
        if (Weapon)
        {
            var capsuleCollider = Weapon.GetComponent<CapsuleCollider>();
            capsuleCollider.enabled = true;
        }
    }

    public void CantHit()
    {
        if (Weapon)
        {
            var capsuleCollider = Weapon.GetComponent<CapsuleCollider>();
            capsuleCollider.enabled = false;
        }
    }

    public void FinishedAttack()
    {
        var animator = GetComponent<Animator>();
        animator.SetBool("IsAttacking", false);
        IsAttacking = false;
        //animator.SetInteger("CurrentAttack",Random.Range(1,3));
    }

    private void GameOver()
    {
        //Load UI for GameOver.
    }
}
