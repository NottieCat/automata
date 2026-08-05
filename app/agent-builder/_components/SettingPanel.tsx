import { WorkflowContext } from '@/context/WorkflowContext';
import React, { useContext } from 'react'
import AgentSettings from '../_nodeSettings/AgentSettings';
import EndSettings from '../_nodeSettings/EndSettings';
import IfElseSettings from '../_nodeSettings/IfElseSettings';
import WhileSettings from '../_nodeSettings/WhileSettings';
import UserApproval from '../_nodeSettings/UserApproval';
import ApiAgentSettings from '../_nodeSettings/ApiSettings';

function SettingPanel() {
    const {selectedNode, setAddedNodes} = useContext(WorkflowContext);

    const onUpdateNodeData = (formData: any) => {
        const updateNode = {
            ...selectedNode,
            data: {
                ...selectedNode.data,
                label: formData.name,
                settings: formData
            }
        }

        setAddedNodes((prevNode: any) => prevNode.map((node: any) =>
            node.id === selectedNode.id?updateNode: node
        ))
    }

    

    // Node types that actually have a settings form. StartNode (and any
    // unknown type) has none — rendering the container for it shows an
    // empty white box.
    const typesWithSettings = ['AgentNode', 'EndNode', 'IfElseNode', 'WhileNode', 'UserApprovalNode', 'ApiNode'];

    return selectedNode && typesWithSettings.includes(selectedNode.type) ? (
        <div className='p-5 bg-white rounded-2xl w-[350px] shadow'>
            {selectedNode.type == 'AgentNode' && (
                <AgentSettings
                    selectedNode={selectedNode}
                    updateFormData={(value: any) => onUpdateNodeData(value)}
                />
            )}
            {selectedNode.type == 'EndNode' && <EndSettings 
            selectedNode={selectedNode}
                    updateFormData={(value: any) => onUpdateNodeData(value)}
            />}
            {selectedNode.type == 'IfElseNode' && 
            <IfElseSettings 
            selectedNode={selectedNode}
                    updateFormData={(value: any) => onUpdateNodeData(value)}
            />
            }
            {selectedNode.type == 'WhileNode' && 
            <WhileSettings 
            selectedNode={selectedNode}
                    updateFormData={(value: any) => onUpdateNodeData(value)}
            />
            }
            {selectedNode.type == 'UserApprovalNode' && 
            <UserApproval 
            selectedNode={selectedNode}
                    updateFormData={(value: any) => onUpdateNodeData(value)}
            />
            }
            {selectedNode.type == 'ApiNode' && 
            <ApiAgentSettings 
            selectedNode={selectedNode}
                    updateFormData={(value: any) => onUpdateNodeData(value)}
            />
            }
        </div>
    ) : null
}

export default SettingPanel