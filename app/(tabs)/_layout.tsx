// Layout das abas inferiores (Bottom Tabs)
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useTema } from '@/hooks';
import { TEMA_CORES } from '@/constants';
import { Icones } from '@/components/ui';

// Configura notificações no startup
useEffect(() => {
  // Configuração de notificações seria feita aqui
}, []);

export default function TabLayout() {
  const { tema } = useTema();
  const cores = TEMA_CORES[tema];
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: cores.primario,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarStyle: {
          backgroundColor: cores.superficie,
          borderTopWidth: 1,
          borderTopColor: cores.borda,
          height: 70,
          paddingBottom: Platform.OS === 'ios' ? 10 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color }) => (
            <Icones.Home size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Análise',
          tabBarIcon: ({ focused, color }) => (
            <Icones.Grafico size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="formulas"
        options={{
          title: 'Fórmulas',
          tabBarIcon: ({ focused, color }) => (
            <Icones.Formula size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jogos"
        options={{
          title: 'Meus Jogos',
          tabBarIcon: ({ focused, color }) => (
            <Icones.Jogos size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Resultados',
          tabBarIcon: ({ focused, color }) => (
            <Icones.Verificado size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused, color }) => (
            <Icones.Historico size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ focused, color }) => (
            <Icones.Configuracoes size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}