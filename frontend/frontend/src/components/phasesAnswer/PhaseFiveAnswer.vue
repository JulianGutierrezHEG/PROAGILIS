<template>
    <div>
        <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ localCurrentPhaseName }}</h3>
        <h4 class="font-bold text-lg text-center mb-4">User Stories choisie pour Sprint {{ currentSprint }}</h4>
        <div class="flex justify-center">
            <div class="max-w-2xl w-full">
                <div class="overflow-y-auto" style="max-height: 300px;">
                    <div v-for="(story, index) in localPhaseAnswer.userStories" :key="index" class="mb-4">
                        <UserStoryCard :story="story" />
                    </div>
                </div>
            </div>
        </div>
        <div v-if="phaseNeedsValidation" class="flex justify-center mt-4">
            <ValidationButtons />
        </div>
    </div>
</template>

<script setup>
import { ref, inject, onMounted, provide, onUnmounted } from 'vue';
import ValidationButtons from '@/components/interactables/ValidationButtons.vue';
import { useGame } from '@/composables/useGame';
import EventBus from '@/services/eventBus';
import UserStoryCard from '@/components/interactables/UserStoryCard.vue';

const groupId = inject('groupId');
const phaseId = inject('phaseId');
const phaseNeedsValidation = inject('phaseNeedsValidation');

const localCurrentPhaseName = ref('');
const localPhaseAnswer = ref({ userStories: [] });
const currentSprint = ref(1);
const { fetchGroupPhaseAnswer, fetchUserStories, fetchProjectDetails } = useGame(groupId.value);
const preparedPhaseAnswer = ref({});

const preparePhaseAnswer = () => {
    preparedPhaseAnswer.value = {
        userStories: localPhaseAnswer.value.userStories.map(story => story.id)
    };
};

provide('phaseAnswer', preparedPhaseAnswer);

const fetchPhaseData = async () => {
    try {
        const answerData = await fetchGroupPhaseAnswer(groupId.value, phaseId.value);
        console.log('answerData:', answerData);
        if (answerData) {
            localCurrentPhaseName.value = answerData.phase_name;
            if (answerData.answer && answerData.answer.userStories) {
                const userStoryIds = answerData.answer.userStories.map(story => story.id || story);
                console.log('Fetching user stories for answer:', userStoryIds);
                const response = await fetchUserStories(groupId.value, userStoryIds);
                localPhaseAnswer.value.userStories = response;
                preparePhaseAnswer(); 
                console.log('Fetched user stories for phase answer:', response);
            }
        }

        const projectDetails = await fetchProjectDetails(groupId.value);
        if (projectDetails && projectDetails.current_sprint) {
            currentSprint.value = projectDetails.current_sprint;
        }
    } catch (error) {
        console.error('Error fetching phase data:', error);
    }
};

const handlePhaseAnswerUpdate = async (data) => {
    if (data.group_id === groupId.value && data.phase_id === phaseId.value) {
        if (data.answer && data.answer.userStories) {
            const userStoryIds = data.answer.userStories.map(story => story.id || story);
            console.log('Handling phase answer update, fetching user stories:', userStoryIds);
            const response = await fetchUserStories(groupId.value, userStoryIds);
            localPhaseAnswer.value.userStories = response;
            preparePhaseAnswer(); 
        } else {
            localPhaseAnswer.value.userStories = [];
            preparePhaseAnswer(); 
        }
    }
};

onMounted(() => {
    fetchPhaseData();
    EventBus.on('phase_answer_update', handlePhaseAnswerUpdate);
});

onUnmounted(() => {
    EventBus.off('phase_answer_update', handlePhaseAnswerUpdate);
});
</script>
