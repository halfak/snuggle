"""
This module provides functionality for determining a desirability score for a 
user based on vandal fighting scores from STiki.

Parameters to beta distributions are hard-coded based on an analysis performed
using datasets derived from hand coding.
http://blog.wikimedia.org/2012/03/27/analysis-of-the-quality-of-newcomers-in-wikipedia-over-time/
"""
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
			model.cdf(max(score - EPSILON, EPSILON))
		)
	
	try:
		return exp(log_p)
	except OverflowError:
		return 1


def likelihood(scores):
	if len(scores) == 0:
		return DESIRABLE_PRIOR
	else:
		desirable_p = beta_likelihood(scores, DESIRABLE) * DESIRABLE_PRIOR
		undesirable_p = beta_likelihood(scores, UNDESIRABLE) * UNDESIRABLE_PRIOR
		
		return desirable_p / (desirable_p + undesirable_p)

def ratio(scores):
	if len(scores) == 0:
		return DESIRABLE_PRIOR/UNDESIRABLE_PRIOR
	else:
		desirable_p = beta_likelihood(scores, DESIRABLE) * DESIRABLE_PRIOR
		undesirable_p = beta_likelihood(scores, UNDESIRABLE) * UNDESIRABLE_PRIOR
		
		return desirable_p / undesirable_p
	

