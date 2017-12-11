using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[RequireComponent(typeof(CapsuleCollider))]
[RequireComponent(typeof(Rigidbody))]
public class Weapon : MonoBehaviour
{
    public GameObject owner;
    public int Damage;

    private Player player = null;

    public void Start()
    {
        var playerComponent = owner.GetComponent<Player>();
        if (playerComponent)
        {
            player = playerComponent;
        }
    }

    private void OnCollisionEnter(Collision other)
    {
        if (other.transform.CompareTag("Enemy") && player.IsAttacking)
        {
            var baseEnemy = other.transform.GetComponent<BaseEnemy>();
            baseEnemy.ChangeHealthByAmount(Damage);

            var capsuleCollider = GetComponent<CapsuleCollider>();
            capsuleCollider.enabled = false;
        }
    }
}
