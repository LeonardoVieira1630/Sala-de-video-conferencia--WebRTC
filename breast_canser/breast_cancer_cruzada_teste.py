"""
Tentando melhorar o arquivo rede para que a taxa de acerto vire 0,9
"""

import pandas as pd
from keras.models import Sequential
from keras.layers import Dense
#Essa importação vai servir pra fazermos a validação cruzada
from keras.wrappers.scikit_learn import KerasClassifier
#Importando função que fara a divisão da base de dados e validação cruzada
from sklearn.model_selection import cross_val_score
#Importando a função que cria a rede neural
from Rede import criarRede

#Abrindo arquivos de entrada
previsores = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/entradas_breast.csv')
classe = pd.read_csv('/home/leonardo/Área de Trabalho/Python/Linse_Python/Curso_redes_neurais/breast_canser/saidas_breast.csv')


classificador = KerasClassifier(build_fn=criarRede, epochs=100,batch_size=10)


resultados = cross_val_score(estimator=classificador,X=previsores,y=classe,cv=10,scoring='accuracy')

media = resultados.mean()
desvio = resultados.std()

print(f'A média de acerto de todas as separações diferente de base de dado e teste foi {media}.')
print(f'O Desvio padrão da porcentagem de acertos foi de {desvio}.')