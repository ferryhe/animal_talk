from fastmcp import FastMCP
import subprocess
import os
import sys  # <--- 新增导入

mcp = FastMCP("Animal Talk Tools")

@mcp.tool()
def list_current_files() -> str:
    """列出当前项目目录下的所有文件，用于检查结构"""
    try:
        # 强制指定工作目录为项目根目录，防止路径跑偏
        cwd = r"C:\projects\animal_talk" 
        command = ["dir"] if os.name == 'nt' else ["ls", "-R"]
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=cwd)
        return result.stdout
    except Exception as e:
        return f"列出文件失败: {str(e)}"

@mcp.tool()
def run_python_script(script_name: str = "main.py") -> str:
    """
    运行指定的 Python 脚本并返回输出。
    """
    try:
        # 安全检查
        if ".." in script_name or "/" in script_name or "\\" in script_name:
            return "为了安全，只允许运行当前目录下的文件名，不能包含路径。"
            
        cwd = r"C:\projects\animal_talk"
        print(f"正在尝试运行: {script_name}...")
        
        # 使用 sys.executable 确保使用当前的虚拟环境 Python
        result = subprocess.run(
            [sys.executable, script_name], 
            capture_output=True, 
            text=True,
            timeout=10,
            cwd=cwd # 确保在正确目录下运行
        )
        
        output = f"--- STDOUT ---\n{result.stdout}\n\n--- STDERR ---\n{result.stderr}"
        if result.returncode == 0:
            return f"✅ 脚本执行成功:\n{output}"
        else:
            return f"❌ 脚本执行出错 (Return Code {result.returncode}):\n{output}"
            
    except subprocess.TimeoutExpired:
        return "❌ 执行超时（超过10秒）。"
    except Exception as e:
        return f"❌ 执行发生异常: {str(e)}"

if __name__ == "__main__":
    mcp.run()