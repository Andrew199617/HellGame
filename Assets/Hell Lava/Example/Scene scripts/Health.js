////////////////////////////////////////////////////////////////
// This script handle objects health:                         //
// - assign max health                                        //
// - set death if currentHealth < 0                           //
// - display current health for player                        //
////////////////////////////////////////////////////////////////
#pragma strict
var maxHealth : float;
var currentHealth : float;
var death : boolean;

function Start () {
	currentHealth = maxHealth;
}

function Update () {
	if (currentHealth<=0)
		death = true;
	else
		death = false;
}