<template>
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Phase 1: Création d'un Projet</h2>
      <p class="mb-4">
        Le directeur du centre commercial Startcourt veut proposer, aux boutiques qu’il héberge, un service de création de site de e-commerce. Ainsi, chaque boutique qui en fera la demande pourra avoir son propre site de vente en ligne. Il fait donc appel à votre société pour développer les sites de vente en ligne pour les boutiques qui en font la demande.
        Votre société utilisant habituellement Scrum comme méthode de gestion de projet, vous allez la mettre aussi en œuvre pour ce projet.
      </p>
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label for="projectName" class="block text-gray-700">Nom du projet</label>
          <input type="text" id="projectName" v-model="projectName" class="mt-1 block w-full p-2 border rounded-md" required />
        </div>
        <div class="mb-4">
          <label for="product" class="block text-gray-700">Que vendrez-vous ?</label>
          <select id="product" v-model="product" class="mt-1 block w-full p-2 border rounded-md" required>
            <option value="clothes">Vêtements</option>
            <option value="electronics">Électronique</option>
            <option value="food">Alimentation</option>
            <option value="books">Livres</option>
            <option value="furniture">Meubles</option>
          </select>
        </div>
        <div class="mb-4 flex">
          <div class="w-1/2 pr-2">
            <label class="block text-gray-700">Membres de l'équipe</label>
            <ul class="bg-white p-2 border rounded-md h-72 overflow-y-auto">
              <li v-for="member in availableMembers" :key="member" class="p-2 border-b cursor-pointer" draggable="true" @dragstart="dragStart(member)">
                {{ member }}
              </li>
            </ul>
          </div>
          <div class="w-1/2 pl-2">
            <label class="block text-gray-700">Rôles de l'équipe</label>
            <div class="bg-white p-2 border rounded-md h-72">
              <div class="mb-4">
                <p class="font-semibold">Scrum Master</p>
                <div class="p-2 border h-12" @dragover.prevent @drop="drop('scrumMaster')">
                  {{ roles.scrumMaster || 'Déposez ici' }}
                </div>
              </div>
              <div class="mb-4">
                <p class="font-semibold">Product Owner</p>
                <div class="p-2 border h-12" @dragover.prevent @drop="drop('productOwner')">
                  {{ roles.productOwner || 'Déposez ici' }}
                </div>
              </div>
              <div>
                <p class="font-semibold">Développeurs</p>
                <div class="p-2 border h-12 overflow-y-auto" @dragover.prevent @drop="drop('developers')">
                  <span v-if="roles.developers.length === 0">Déposez ici</span>
                  <span v-else>{{ roles.developers.join(', ') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const projectName = ref('');
  const product = ref('');
  const roles = ref({
    scrumMaster: '',
    productOwner: '',
    developers: []
  });
  
  const teamMembers = ref(['Alice', 'Bob', 'Charlie', 'Dave']);
  const availableMembers = computed(() => {
    const assignedMembers = new Set([roles.value.scrumMaster, roles.value.productOwner, ...roles.value.developers]);
    return teamMembers.value.filter(member => !assignedMembers.has(member));
  });
  
  const dragStart = (member) => {
    event.dataTransfer.setData('text/plain', member);
  };
  
  const drop = (role) => {
    const member = event.dataTransfer.getData('text/plain');
    if (role === 'developers') {
      if (!roles.value.developers.includes(member) && member !== roles.value.scrumMaster && member !== roles.value.productOwner) {
        roles.value.developers.push(member);
      }
    } else {
      roles.value[role] = member;
    }
  };
  
  const submitForm = () => {
    // Logic to handle form submission
    console.log('Nom du projet:', projectName.value);
    console.log('Produit:', product.value);
    console.log('Rôles:', roles.value);
  };
  </script>
  