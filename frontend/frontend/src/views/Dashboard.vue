<template>
    <div class="w-4/5 max-h-screen overflow-hidden bg-gray-200 shadow-lg rounded-lg p-2 mx-auto my-8">
      <h1 class="text-2xl font-bold text-center mb-8">Tableau de bord</h1>
      <div class="w-full mx-auto overflow-auto scrollbar-thin" style="max-height: 70vh;">
        <div class="w-full bg-white shadow-lg rounded-lg p-6 mb-10">
          <h2 class="font-bold text-xl mb-4">Session Name</h2>
        </div>
        <div class="w-full bg-white shadow-lg rounded-lg p-6 mb-10">
          <h2 class="font-bold text-xl mb-4">Session Name</h2>
        </div>
        <div class="w-full bg-white shadow-lg rounded-lg p-6 mb-10">
          <h2 class="font-bold text-xl mb-4">Session Name</h2>
        </div>
        <div class="w-full bg-white shadow-lg rounded-lg p-6 mb-10">
          <h2 class="font-bold text-xl mb-4">Session Name</h2>
        </div>
        <div class="w-full bg-white shadow-lg rounded-lg p-6 mb-10">
          <h2 class="font-bold text-xl mb-4">Session Name</h2>
        </div>
        <div class="w-full bg-white shadow-lg rounded-lg p-6 mb-10">
          <h2 class="font-bold text-xl mb-4">Session Name</h2>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  </script>
 
<!--
 A FAIRE ET IMPLEMENTER
<template>
    <div class="p-6 flex justify-center">
      <div class="w-full">
        <h1 class="text-2xl font-semibold mb-6">Sessions</h1>
        <div class="space-y-6">
          <div v-for="session in sessions" :key="session.id" class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-xl font-semibold mb-4">{{ session.name }}</h2>
            <div class="flex flex-wrap -mx-2">
              
              <div class="w-full md:w-1/2 lg:w-1/4 px-2">
                <div class="bg-white shadow-md rounded-lg p-4 h-full">
                  <h3 class="text-lg font-semibold mb-2">Groupes vides</h3>
                  <ul class="list-disc list-inside">
                    <li v-for="id in session.number_of_groups" :key="id">Groupe {{ id }}</li>
                  </ul>
                </div>
              </div>
              <div class="w-full md:w-1/2 lg:w-3/4 px-2">
                <div class="bg-white shadow-md rounded-lg p-4 h-full">
                  <h3 class="text-lg font-semibold mb-2">Groupes avec des membres</h3>
                  <ul class="list-disc list-inside">
                    <li v-for="group in session.groups.filter(group => group.users.length > 0) || []" :key="group.id">
                      Groupe {{ group.id }}: {{ group.users.map(user => user.username).join(', ') }}
                    </li>
                  </ul>
                  <button class="ml-4 text-blue-500 hover:text-blue-700">
                    <img src="https://cdn-icons-png.flaticon.com/512/18/18398.png" alt="info" class="w-6 h-6">
                  </button>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between mt-4 border-t pt-4">
              <button class="text-gray-500 hover:text-gray-700">
                <img src="https://cdn-icons-png.flaticon.com/512/93/93634.png" alt="settings" class="w-6 h-6">
              </button>
              <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                Play
              </button>
              <button class="text-red-500 hover:text-red-700">
                <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" alt="delete" class="w-6 h-6">
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
-->
 