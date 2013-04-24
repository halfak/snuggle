from scipy.stats import beta
from math import log, factorial, exp

DESIRABLE = beta(1.277007, 6.254439)
DESIRABLE_PRIOR = .8
UNDESIRABLE = beta(1.973121, 3.162627)
UNDESIRABLE_PRIOR = .2
EPSILON = 0.005

def beta_likelihood(scores, model):
	log_p = log(factorial(len(scores)))
	
	for score in scores:
		log_p += log(
			model.cdf(min(score + EPSILON, 1)) - 
			model.cdf(max(score - EPSILON, 0.005))
		)
	
	return exp(log_p)


def likelihood(scores):
	desirable_p = beta_likelihood(scores, DESIRABLE) * DESIRABLE_PRIOR
	undesirable_p = beta_likelihood(scores, UNDESIRABLE) * UNDESIRABLE_PRIOR
	
	return desirable_p / (desirable_p + undesirable_p)
	

