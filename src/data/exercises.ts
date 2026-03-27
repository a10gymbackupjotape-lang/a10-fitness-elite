export interface LibraryExercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  isCustom?: boolean;
}

export const BASE_EXERCISES: LibraryExercise[] = [
  // --- Originais ---
  { id: '1', name: 'Supino Reto (Barra)', muscle: 'Peito', equipment: 'Barra' },
  { id: '2', name: 'Agachamento (Barra)', muscle: 'Pernas', equipment: 'Barra' },
  { id: '3', name: 'Levantamento Terra (Barra)', muscle: 'Costas', equipment: 'Barra' },
  { id: '4', name: 'Desenvolvimento (Halteres)', muscle: 'Ombros', equipment: 'Halteres' },
  { id: '5', name: 'Rosca Direta (Halteres)', muscle: 'Bíceps', equipment: 'Halteres' },
  { id: '6', name: 'Tríceps Pulley (Cabo)', muscle: 'Tríceps', equipment: 'Cabo' },
  { id: '7', name: 'Puxada Frontal (Máquina)', muscle: 'Costas', equipment: 'Máquina' },
  { id: '8', name: 'Leg Press (Máquina)', muscle: 'Pernas', equipment: 'Máquina' },

  // --- 1. Pernas e Glúteos ---
  { id: 'pg-1', name: 'Cadeira Extensora', muscle: 'Pernas', equipment: 'Máquina' },
  { id: 'pg-2', name: 'Cadeira Flexora (Mesa Flexora)', muscle: 'Pernas', equipment: 'Máquina' },
  { id: 'pg-3', name: 'Leg Press 45°', muscle: 'Pernas', equipment: 'Máquina' },
  { id: 'pg-4', name: 'Leg Press Horizontal', muscle: 'Pernas', equipment: 'Máquina' },
  { id: 'pg-5', name: 'Hack Machine', muscle: 'Pernas', equipment: 'Máquina' },
  { id: 'pg-6', name: 'Smith Machine (Agachamento)', muscle: 'Pernas', equipment: 'Smith' },
  { id: 'pg-7', name: 'Cadeira Adutora', muscle: 'Pernas', equipment: 'Máquina' },
  { id: 'pg-8', name: 'Cadeira Abdutora', muscle: 'Pernas', equipment: 'Máquina' },
  { id: 'pg-9', name: 'Gêmeos em Pé (Panturrilha)', muscle: 'Pernas', equipment: 'Máquina' },
  { id: 'pg-10', name: 'Gêmeos Sentado', muscle: 'Pernas', equipment: 'Máquina' },

  // --- 2. Costas ---
  { id: 'ct-1', name: 'Puxada Alta (Barra ou Triângulo)', muscle: 'Costas', equipment: 'Cabo' },
  { id: 'ct-2', name: 'Remada Baixa (Polia Baixa)', muscle: 'Costas', equipment: 'Cabo' },
  { id: 'ct-3', name: 'Remada Curvada Máquina (T-Bar)', muscle: 'Costas', equipment: 'Máquina' },
  { id: 'ct-4', name: 'Remada Unilateral (Máquina/Polia)', muscle: 'Costas', equipment: 'Máquina' },
  { id: 'ct-5', name: 'Pulldown Neutro (Graviton)', muscle: 'Costas', equipment: 'Máquina' },
  { id: 'ct-6', name: 'Máquina Remada Sentada', muscle: 'Costas', equipment: 'Máquina' },
  { id: 'ct-7', name: 'Crucifixo Invertido', muscle: 'Costas', equipment: 'Halteres' },

  // --- 3. Peito ---
  { id: 'pt-1', name: 'Supino Reto Máquina', muscle: 'Peito', equipment: 'Máquina' },
  { id: 'pt-2', name: 'Supino Inclinado Máquina', muscle: 'Peito', equipment: 'Máquina' },
  { id: 'pt-3', name: 'Supino Declinado Máquina', muscle: 'Peito', equipment: 'Máquina' },
  { id: 'pt-4', name: 'Peck Deck (Voador)', muscle: 'Peito', equipment: 'Máquina' },
  { id: 'pt-5', name: 'Crucifixo Máquina', muscle: 'Peito', equipment: 'Máquina' },
  { id: 'pt-6', name: 'Crossover (Polia Dupla)', muscle: 'Peito', equipment: 'Cabo' },

  // --- 4. Ombros ---
  { id: 'om-1', name: 'Máquina Elevação Lateral', muscle: 'Ombros', equipment: 'Máquina' },
  { id: 'om-2', name: 'Máquina Desenvolvimento', muscle: 'Ombros', equipment: 'Máquina' },
  { id: 'om-3', name: 'Remada Alta na Máquina', muscle: 'Ombros', equipment: 'Máquina' },
  { id: 'om-4', name: 'Voador Posterior', muscle: 'Ombros', equipment: 'Máquina' },

  // --- 5. Bíceps ---
  { id: 'bi-1', name: 'Máquina Rosca Scott', muscle: 'Bíceps', equipment: 'Máquina' },
  { id: 'bi-2', name: 'Máquina Rosca Concentrada', muscle: 'Bíceps', equipment: 'Máquina' },
  { id: 'bi-3', name: 'Polia Alta para Rosca', muscle: 'Bíceps', equipment: 'Cabo' },
  { id: 'bi-4', name: 'Banco Scott com Roldana', muscle: 'Bíceps', equipment: 'Máquina' },

  // --- 6. Tríceps ---
  { id: 'tr-1', name: 'Máquina Tríceps Mergulho', muscle: 'Tríceps', equipment: 'Máquina' },
  { id: 'tr-2', name: 'Polia Alta para Tríceps', muscle: 'Tríceps', equipment: 'Cabo' },
  { id: 'tr-3', name: 'Máquina Tríceps Francesa', muscle: 'Tríceps', equipment: 'Máquina' },
  { id: 'tr-4', name: 'Máquina Tríceps Testa', muscle: 'Tríceps', equipment: 'Máquina' },

  // --- 7. Abdômen ---
  { id: 'ab-1', name: 'Máquina Abdominal', muscle: 'Abdômen', equipment: 'Máquina' },
  { id: 'ab-2', name: 'Abdominal na Polia', muscle: 'Abdômen', equipment: 'Cabo' },
  { id: 'ab-3', name: 'Rotação de Tronco', muscle: 'Abdômen', equipment: 'Máquina' },
  { id: 'ab-4', name: 'Banco Abdominal Declinado', muscle: 'Abdômen', equipment: 'Banco' },

  // --- 8. Cardio ---
  { id: 'cd-1', name: 'Esteira', muscle: 'Cardio', equipment: 'Nenhum' },
  { id: 'cd-2', name: 'Bicicleta Ergométrica', muscle: 'Cardio', equipment: 'Nenhum' },
  { id: 'cd-3', name: 'Transport (Elíptico)', muscle: 'Cardio', equipment: 'Nenhum' },
  { id: 'cd-4', name: 'Remador', muscle: 'Cardio', equipment: 'Nenhum' },
  { id: 'cd-5', name: 'Escada (Step Mill)', muscle: 'Cardio', equipment: 'Nenhum' },
  
  // --- 9. Peso Corporal (Bodyweight) ---
  { id: 'bw-1', name: 'Flexão de Braços', muscle: 'Peito', equipment: 'Peso Corporal' },
  { id: 'bw-2', name: 'Barra Fixa (Pronada)', muscle: 'Costas', equipment: 'Peso Corporal' },
  { id: 'bw-3', name: 'Paralelas', muscle: 'Tríceps', equipment: 'Peso Corporal' },
  { id: 'bw-4', name: 'Agachamento Livre', muscle: 'Pernas', equipment: 'Peso Corporal' },
  { id: 'bw-5', name: 'Afundo (Lunge)', muscle: 'Pernas', equipment: 'Peso Corporal' },
  { id: 'bw-6', name: 'Prancha Abdominal', muscle: 'Abdômen', equipment: 'Peso Corporal' },
];
