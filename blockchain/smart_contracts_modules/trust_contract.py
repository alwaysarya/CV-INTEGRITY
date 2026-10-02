"""
Trust Smart Contract
Automatic decisions based on trust score rules
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from datetime import datetime
from pathlib import Path


class TrustContract:
    """Smart Contract for Trust Score based decisions"""
    
    def __init__(self):
        # Contract rules
        self.rules = {
            'ACCEPT': {'min_score': 80, 'action': 'deploy_to_production'},
            'REVIEW': {'min_score': 50, 'max_score': 79, 'action': 'manual_review_required'},
            'QUARANTINE': {'max_score': 49, 'action': 'reject_and_retrain'}
        }
        self.execution_log = []
        self.contract_address = "0xTRUST_CONTRACT_v1"
    
    def execute(self, trust_data):
        """
        Execute contract based on trust scores
        Returns automatic decisions
        """
        execution = {
            'contract_address': self.contract_address,
            'executed_at': datetime.now().isoformat(),
            'input_data': trust_data,
            'decisions': {},
            'auto_actions': []
        }
        
        for dataset, data in trust_data.items():
            score = data.get('final_score', 0)
            
            # Determine decision
            if score >= 80:
                decision = 'ACCEPT'
                action = self.rules['ACCEPT']['action']
                color = '#00D9A3'
            elif score >= 50:
                decision = 'REVIEW'
                action = self.rules['REVIEW']['action']
                color = '#FFB84D'
            else:
                decision = 'QUARANTINE'
                action = self.rules['QUARANTINE']['action']
                color = '#FF4757'
            
            execution['decisions'][dataset] = {
                'trust_score': score,
                'decision': decision,
                'action': action,
                'color': color,
                'auto_triggered': True
            }
            
            execution['auto_actions'].append({
                'dataset': dataset,
                'action': action,
                'timestamp': datetime.now().isoformat(),
                'status': 'executed'
            })
        
        # Save execution to log
        self.execution_log.append(execution)
        self._save_execution_log(execution)
        
        return execution
    
    def verify_decision(self, dataset, score):
        """Verify what decision contract will make"""
        if score >= 80:
            return 'ACCEPT'
        elif score >= 50:
            return 'REVIEW'
        else:
            return 'QUARANTINE'
    
    def _save_execution_log(self, execution):
        """Save execution to file"""
        log_path = Path('outputs/reports/contract_execution.json')
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Load existing or create new
        if log_path.exists():
            with open(log_path, 'r') as f:
                existing = json.load(f)
        else:
            existing = {'executions': [], 'contract_address': self.contract_address}
        
        existing['executions'].append(execution)
        existing['last_executed'] = execution['executed_at']
        existing['total_executions'] = len(existing['executions'])
        
        with open(log_path, 'w') as f:
            json.dump(existing, f, indent=2)
    
    def get_contract_info(self):
        """Get contract information"""
        return {
            'address': self.contract_address,
            'version': '1.0.0',
            'type': 'Trust Decision Contract',
            'rules': self.rules,
            'total_executions': len(self.execution_log)
        }


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔗 SMART CONTRACT EXECUTION")
    print("="*60 + "\n")
    
    contract = TrustContract()
    
    # Load trust data
    trust_path = Path('outputs/reports/final_trust_report.json')
    if trust_path.exists():
        with open(trust_path, 'r') as f:
            trust_data = json.load(f)
    else:
        # Demo data
        trust_data = {
            'good': {'final_score': 88.0},
            'bad': {'final_score': 68.0},
            'worst': {'final_score': 45.0}
        }
    
    # Execute contract
    result = contract.execute(trust_data)
    
    print(f"📄 Contract: {result['contract_address']}")
    print(f"⏰ Executed: {result['executed_at']}")
    print()
    
    for dataset, decision in result['decisions'].items():
        print(f"📊 {dataset.upper()}:")
        print(f"   Score: {decision['trust_score']}%")
        print(f"   Decision: {decision['decision']}")
        print(f"   Action: {decision['action']}")
        print()
    
    print("="*60)
    print("✅ Contract executed successfully!")
    print("="*60)