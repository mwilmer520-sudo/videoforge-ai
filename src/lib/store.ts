import { create } from "zustand";
import type { Storyboard, Brief, Scene, Voiceover, MusicTrack, VideoConcept } from "./types";

interface AppState {
  // Concepts (agent presents multiple options)
  concepts: VideoConcept[] | null;
  setConcepts: (concepts: VideoConcept[]) => void;
  selectedConceptId: string | null;
  selectConcept: (id: string) => void;

  // Current storyboard (set when user picks a concept)
  storyboard: Storyboard | null;
  setStoryboard: (sb: Storyboard) => void;

  // UI state
  selectedSceneId: string | null;
  selectScene: (id: string | null) => void;
  activeTab: "storyboard" | "preview" | "export";
  setActiveTab: (tab: "storyboard" | "preview" | "export") => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  generationStep: string;
  setGenerationStep: (step: string) => void;

  // Scene operations
  updateScene: (id: string, updates: Partial<Scene>) => void;
  removeScene: (id: string) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  addScene: (scene: Scene) => void;

  // Voiceover operations
  updateVoiceover: (updates: Partial<Voiceover>) => void;

  // Music operations
  updateMusic: (updates: Partial<MusicTrack>) => void;

  // Reset
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  concepts: null,
  setConcepts: (concepts) => set({ concepts }),
  selectedConceptId: null,
  selectConcept: (id) =>
    set((state) => {
      const concept = state.concepts?.find((c) => c.id === id);
      return {
        selectedConceptId: id,
        storyboard: concept?.storyboard || null,
        activeTab: "storyboard",
      };
    }),

  storyboard: null,
  setStoryboard: (sb) => set({ storyboard: sb }),

  selectedSceneId: null,
  selectScene: (id) => set({ selectedSceneId: id }),
  activeTab: "storyboard",
  setActiveTab: (tab) => set({ activeTab: tab }),

  isGenerating: false,
  setIsGenerating: (v) => set({ isGenerating: v }),
  generationStep: "",
  setGenerationStep: (step) => set({ generationStep: step }),

  updateScene: (id, updates) =>
    set((state) => {
      if (!state.storyboard) return state;
      return {
        storyboard: {
          ...state.storyboard,
          scenes: state.storyboard.scenes.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        },
      };
    }),

  removeScene: (id) =>
    set((state) => {
      if (!state.storyboard) return state;
      const scenes = state.storyboard.scenes
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i }));
      return {
        storyboard: { ...state.storyboard, scenes },
        selectedSceneId:
          state.selectedSceneId === id ? null : state.selectedSceneId,
      };
    }),

  reorderScenes: (fromIndex, toIndex) =>
    set((state) => {
      if (!state.storyboard) return state;
      const scenes = [...state.storyboard.scenes];
      const [moved] = scenes.splice(fromIndex, 1);
      scenes.splice(toIndex, 0, moved);
      return {
        storyboard: {
          ...state.storyboard,
          scenes: scenes.map((s, i) => ({ ...s, order: i })),
        },
      };
    }),

  addScene: (scene) =>
    set((state) => {
      if (!state.storyboard) return state;
      return {
        storyboard: {
          ...state.storyboard,
          scenes: [...state.storyboard.scenes, scene],
        },
      };
    }),

  updateVoiceover: (updates) =>
    set((state) => {
      if (!state.storyboard) return state;
      return {
        storyboard: {
          ...state.storyboard,
          voiceover: { ...state.storyboard.voiceover, ...updates },
        },
      };
    }),

  updateMusic: (updates) =>
    set((state) => {
      if (!state.storyboard) return state;
      return {
        storyboard: {
          ...state.storyboard,
          music: { ...state.storyboard.music, ...updates },
        },
      };
    }),

  reset: () =>
    set({
      concepts: null,
      selectedConceptId: null,
      storyboard: null,
      selectedSceneId: null,
      activeTab: "storyboard",
      isGenerating: false,
      generationStep: "",
    }),
}));
